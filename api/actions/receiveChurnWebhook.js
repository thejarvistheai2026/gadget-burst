import { sendEmail } from "../lib/sendEmail.js";

/** @type { ActionRun } */
export const run = async ({ params, logger, api, config }) => {
  const { accountName, accountEmail, company, churnReason, slackMessageId, churnDate } = params;
  
  // Deduplicate by slackMessageId
  const existing = await api.churnEvent.findMaybe({
    filter: { slackMessageId: { equals: slackMessageId } }
  });
  
  if (existing) {
    logger.info({ slackMessageId }, "Duplicate churn event - skipping");
    return { status: "duplicate", churnEventId: existing.id };
  }

  // Get template for this reason
  const template = await api.churnTemplate.findMaybe({
    filter: { 
      churnReason: { equals: churnReason },
      isActive: { equals: true }
    }
  });

  if (!template) {
    logger.warn({ churnReason }, "No active template found for reason");
  }

  // Create churn event record
  const churnEvent = await api.churnEvent.create({
    accountName,
    accountEmail,
    company: company || null,
    churnReason,
    slackMessageId,
    churnDate: new Date(churnDate),
    emailStatus: template ? "pending" : "pending"
  });

  // Send email if template exists
  if (template) {
    try {
      const markdownToHtml = (markdown) => {
        if (!markdown) return '';
        let html = markdown;
        // Convert **text** to <strong>text</strong>
        html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        // Convert [text](url) to <a href="url">text</a>
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
        // Convert newlines to paragraphs
        const lines = html.split('\n');
        let result = [];
        let inList = false;
        
        for (let line of lines) {
          line = line.trim();
          if (line.match(/^[\*\-]\s+/)) {
            if (!inList) {
              result.push('<ul>');
              inList = true;
            }
            result.push(`<li>${line.replace(/^[\*\-]\s+/, '')}</li>`);
          } else {
            if (inList) {
              result.push('</ul>');
              inList = false;
            }
            if (line.length > 0) {
              result.push(`<p>${line}</p>`);
            }
          }
        }
        if (inList) result.push('</ul>');
        return result.join('');
      };

      const result = await sendEmail({
        to: accountEmail,
        subject: template.subject,
        text: template.body.markdown,
        html: markdownToHtml(template.body.markdown),
        variables: {
          account_name: accountName,
          company: company || '',
          email: accountEmail
        }
      }, { config, logger });

      await api.churnEvent.update(churnEvent.id, {
        emailStatus: "sent",
        sentAt: new Date()
      });

      logger.info({ churnEventId: churnEvent.id, messageId: result.messageId }, "Churn email sent");
    } catch (error) {
      logger.error({ error: error.message }, "Failed to send churn email");
      await api.churnEvent.update(churnEvent.id, {
        emailStatus: "failed"
      });
    }
  }

  return { status: "success", churnEventId: churnEvent.id };
};

/** @type { ActionParams } */
export const params = {
  accountName: { type: "string" },
  accountEmail: { type: "string" },
  company: { type: "string", required: false },
  churnReason: { type: "string" },
  slackMessageId: { type: "string" },
  churnDate: { type: "string" }
};
