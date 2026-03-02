import { sendEmail } from "../lib/sendEmail.js";
// This comment is here for a test
// Post reply to Slack thread
const postSlackReply = async ({ channelId, threadId, message, botToken }) => {
  if (!channelId || !threadId || !botToken) return;
  
  try {
    const response = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${botToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        channel: channelId,
        thread_ts: threadId,
        text: message
      })
    });
    return await response.json();
  } catch (error) {
    console.error('Failed to post Slack reply:', error);
  }
};

/** @type { ActionRun } */
export const run = async ({ params, logger, api, config }) => {
  const { 
    accountName, 
    accountEmail, 
    company, 
    churnReason, 
    slackMessageId, 
    slackThreadId,
    slackChannelId,
    slackBotToken,
    mrr,
    planTier,
    previousPlan,
    churnDate 
  } = params;
  
  // Deduplicate by slackMessageId
  const existingResults = await api.internal.churnEvent.findMany({
    filter: { slackMessageId: { equals: slackMessageId } }
  });
  const existing = existingResults[0] ?? null;
  
  if (existing) {
    logger.info({ slackMessageId }, "Duplicate churn event - skipping");
    return { status: "duplicate", churnEventId: existing.id };
  }

  // Get template for this reason
  const templateResults = await api.internal.churnTemplate.findMany({
    filter: { 
      churnReason: { equals: churnReason },
      isActive: { equals: true }
    }
  });
  const template = templateResults[0] ?? null;

  if (!template) {
    logger.warn({ churnReason }, "No active template found for reason");
  }

  // Create churn event record
  const churnEvent = await api.internal.churnEvent.create({
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

      await api.internal.churnEvent.update(churnEvent.id, {
        emailStatus: "sent",
        sentAt: new Date()
      });

      logger.info({ churnEventId: churnEvent.id, messageId: result.messageId }, "Churn email sent");
    } catch (error) {
      logger.error({ error: error.message }, "Failed to send churn email");
      await api.internal.churnEvent.update(churnEvent.id, {
        emailStatus: "failed"
      });
    }
  }

  // Post Slack thread reply
  await postSlackReply({
    channelId: slackChannelId,
    threadId: slackThreadId || slackMessageId,
    message: `✅ Added to Churn Tracker, Investigating & Sending Outreach\n\n• Email Status: ${churnEvent.emailStatus}\n• Reason: ${churnReason}${planTier ? `\n• Plan Tier: ${planTier}` : ''}${mrr ? `\n• MRR: $${mrr}` : ''}`,
    botToken: slackBotToken || config.SLACK_BOT_TOKEN
  });

  return { status: "success", churnEventId: churnEvent.id };
};

/** @type { ActionParams } */
export const params = {
  accountName: { type: "string" },
  accountEmail: { type: "string" },
  company: { type: "string", required: false },
  churnReason: { type: "string" },
  slackMessageId: { type: "string" },
  slackThreadId: { type: "string", required: false },
  slackChannelId: { type: "string", required: false },
  slackBotToken: { type: "string", required: false },
  mrr: { type: "number", required: false },
  planTier: { type: "string", required: false },
  previousPlan: { type: "string", required: false },
  churnDate: { type: "string" }
};
