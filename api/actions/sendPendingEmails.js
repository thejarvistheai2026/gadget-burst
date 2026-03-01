import { ActionOptions } from "gadget-server";
import { sendEmail } from "../lib/sendEmail.js";

/** @type { ActionRun } */
export const run = async ({ params, logger, api, connections, config }) => {
  const now = new Date();
  logger.info({ now }, "Starting sendPendingEmails job");

  const activebursts = await api.burst.findMany({
    filter: {
      status: { equals: "Active" }
    },
    select: {
      id: true,
      userId: true,
      name: true
    }
  });

  logger.info({ count: activebursts.length }, "Found active bursts");

  for (const burst of activebursts) {
    try {
      const enrollments = await api.enrollment.findMany({
        filter: {
          burstId: { equals: burst.id }
        },
        select: {
          id: true,
          enrolledAt: true,
          burstId: true,
          contactId: true,
          userId: true,
          contact: {
            id: true,
            email: true,
            name: true,
            firstName: true,
            company: true,
            status: true
          }
        }
      });

      const emailTemplates = await api.emailTemplate.findMany({
        filter: {
          burstId: { equals: burst.id }
        },
        select: {
          id: true,
          subject: true,
          body: {
            markdown: true
          },
          delayOffset: true,
          burstId: true,
          userId: true
        }
      });

      logger.info({ burstId: burst.id, enrollmentCount: enrollments.length, templateCount: emailTemplates.length }, "Processing burst");

      for (const enrollment of enrollments) {
        // Skip if contact has replied
        if (enrollment.contact.status === 'Replied') {
          logger.info({ enrollmentId: enrollment.id, contactEmail: enrollment.contact.email }, 'Skipping contact - already replied');
          continue;
        }

        const enrolledAt = new Date(enrollment.enrolledAt);

        for (const template of emailTemplates) {
          const delayMs = template.delayOffset * 24 * 60 * 60 * 1000;
          const sendTime = new Date(enrolledAt.getTime() + delayMs);

          if (now >= sendTime) {
            const alreadySent = await api.sentEmail.findMany({
              filter: {
                AND: [
                  { enrollmentId: { equals: enrollment.id } },
                  { emailTemplateId: { equals: template.id } }
                ]
              },
              first: 1
            });

            if (alreadySent.length === 0) {
              logger.info({
                enrollmentId: enrollment.id,
                templateId: template.id,
                contactEmail: enrollment.contact.email
              }, "Sending email");

              try {
                const userSettings = await api.userSettings.findMany({
                  filter: {
                    userId: { equals: enrollment.userId }
                  },
                  select: {
                    globalBcc: true,
                    gmailConnected: true,
                    gmailEmail: true,
                    fromName: true
                  },
                  first: 1
                });

                const bcc = userSettings.length > 0 ? userSettings[0].globalBcc : null;
                const fromName = userSettings.length > 0 ? userSettings[0].fromName : null;

                const markdownToHtml = (markdown) => {
                  if (!markdown) return '';
                  
                  let html = markdown;
                  
                  // Convert **text** to <strong>text</strong> (non-greedy match)
                  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
                  
                  // Convert [text](url) to <a href="url">text</a>
                  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
                  
                  // Split into lines for processing
                  const lines = html.split('\n');
                  let result = [];
                  let inList = false;
                  
                  for (let i = 0; i < lines.length; i++) {
                    const line = lines[i].trim();
                    
                    // Check if line is a bullet point (starts with * or -)
                    if (line.match(/^[\*\-]\s+/)) {
                      if (!inList) {
                        result.push('<ul>');
                        inList = true;
                      }
                      // Remove the bullet and wrap in <li>
                      const content = line.replace(/^[\*\-]\s+/, '');
                      result.push(`<li>${content}</li>`);
                    } else {
                      if (inList) {
                        result.push('</ul>');
                        inList = false;
                      }
                      // Add non-list lines as paragraphs
                      if (line.length > 0) {
                        result.push(`<p>${line}</p>`);
                      }
                    }
                  }
                  
                  // Close list if still open
                  if (inList) {
                    result.push('</ul>');
                  }
                  
                  return result.join('');
                };

                const result = await sendEmail({
                  to: enrollment.contact.email,
                  subject: template.subject,
                  text: template.body.markdown,
                  html: markdownToHtml(template.body.markdown),
                  fromName: fromName || undefined,
                  bcc: bcc || undefined,
                  variables: {
                    first_name: enrollment.contact.firstName || '',
                    name: enrollment.contact.name || '',
                    email: enrollment.contact.email,
                    company: enrollment.contact.company || ''
                  }
                }, { config, logger });

                await api.sentEmail.create({
                  enrollment: { _link: enrollment.id },
                  emailTemplate: { _link: template.id },
                  contact: { _link: enrollment.contactId },
                  burst: { _link: enrollment.burstId },
                  user: { _link: enrollment.userId },
                  sentAt: now,
                  status: "sent",
                  subject: template.subject,
                  messageId: result.messageId || null
                });

                logger.info({
                  enrollmentId: enrollment.id,
                  templateId: template.id,
                  messageId: result.messageId
                }, "Email sent successfully");
              } catch (error) {
                logger.error({
                  enrollmentId: enrollment.id,
                  templateId: template.id,
                  error: error.message
                }, "Failed to send email");

                await api.sentEmail.create({
                  enrollment: { _link: enrollment.id },
                  emailTemplate: { _link: template.id },
                  contact: { _link: enrollment.contactId },
                  burst: { _link: enrollment.burstId },
                  user: { _link: enrollment.userId },
                  sentAt: now,
                  status: "failed",
                  subject: template.subject,
                  errorMessage: error.message
                });
              }
            }
          }
        }
      }
    } catch (error) {
      logger.error({ burstId: burst.id, error: error.message }, "Error processing burst");
    }
  }

  logger.info("sendPendingEmails job completed");
};

/** @type { ActionOptions } */
export const options = {
  triggers: {
    scheduler: [
      { cron: "*/5 * * * *" }
    ]
  }
};
