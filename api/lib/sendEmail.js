import nodemailer from 'nodemailer';

const replaceVariables = (content, vars) => {
  if (!content || !vars) return content;
  return content.replace(/\{\{(.*?)\}\}/g, (match, key) => {
    const trimmedKey = key.trim();
    return vars[trimmedKey] || match;
  });
};

export const sendEmail = async ({ to, subject, text, html, bcc, fromName, variables }, context = {}) => {
  const { config = {}, logger } = context;

  // Validate credentials are configured
  if (!config.GMAIL_USER || !config.GMAIL_APP_PASSWORD) {
    const error = new Error('Email credentials not configured. GMAIL_USER and GMAIL_APP_PASSWORD must be set in config.');
    if (logger) {
      logger.error({ error }, 'Missing email configuration');
    }
    throw error;
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: config.GMAIL_USER,
      pass: config.GMAIL_APP_PASSWORD,
    },
  });

  const mailOptions = {
    from: fromName ? `${fromName} <${config.GMAIL_USER}>` : config.GMAIL_USER,
    to,
    subject: replaceVariables(subject, variables),
    text: replaceVariables(text, variables),
    html: replaceVariables(html, variables),
    bcc,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    if (logger) {
      logger.info({ messageId: info.messageId }, 'Email sent successfully');
    }
    return info;
  } catch (error) {
    if (logger) {
      logger.error({ error }, 'Failed to send email');
    }
    throw error;
  }
};