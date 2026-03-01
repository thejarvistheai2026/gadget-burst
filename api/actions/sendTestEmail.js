import { sendEmail } from "../lib/sendEmail.js";

/** @type { ActionRun } */
export const run = async ({ params, logger, api }) => {
  const recipientEmail = params.recipientEmail;
  
  const result = await sendEmail({
    to: recipientEmail,
    subject: "Test Email from Burst App",
    html: `
      <html>
        <body>
          <h1>Test Email</h1>
          <p>This is a test email from the Burst App to verify your Gmail SMTP configuration is working correctly.</p>
          <p>If you're receiving this email, your email settings are configured properly!</p>
        </body>
      </html>
    `
  });
  
  logger.info({ messageId: result.messageId, recipientEmail }, "Test email sent successfully");
  
  return { messageId: result.messageId };
};

export const params = {
  recipientEmail: { type: "string" }
};
