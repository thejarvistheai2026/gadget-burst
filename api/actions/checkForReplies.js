import { ActionOptions } from 'gadget-server';
import Imap from 'imap-simple';
import { simpleParser } from 'mailparser';

/** @type { ActionRun } */
export const run = async ({ logger, api, config }) => {
  logger.info('Starting reply detection job');
  
  const imapConfig = {
    imap: {
      user: config.GMAIL_USER,
      password: config.GMAIL_APP_PASSWORD,
      host: 'imap.gmail.com',
      port: 993,
      tls: true,
      authTimeout: 10000
    }
  };
  
  try {
    const connection = await Imap.connect(imapConfig);
    await connection.openBox('INBOX');
    
    const searchCriteria = ['UNSEEN'];
    const fetchOptions = {
      bodies: ['HEADER', 'TEXT'],
      markSeen: true
    };
    
    const messages = await connection.search(searchCriteria, fetchOptions);
    logger.info({ count: messages.length }, 'Found unread messages');
    
    for (const message of messages) {
      const header = message.parts.find(part => part.which === 'HEADER');
      const parsed = await simpleParser(header.body);
      
      const inReplyTo = parsed.inReplyTo;
      if (inReplyTo) {
        const sentEmail = await api.sentEmail.maybeFindFirst({
          filter: { messageId: { equals: inReplyTo } },
          select: { id: true, contactId: true, contact: { id: true, email: true } }
        });
        
        if (sentEmail) {
          await api.contact.update(sentEmail.contactId, {
            status: 'Replied'
          });
          logger.info({ contactId: sentEmail.contactId, contactEmail: sentEmail.contact.email, messageId: inReplyTo }, 'Contact replied - status updated');
        }
      }
    }
    
    connection.end();
    logger.info('Reply detection completed');
  } catch (error) {
    logger.error({ error: error.message }, 'Failed to check for replies');
  }
};

/** @type { ActionOptions } */
export const options = {
  triggers: {
    scheduler: [{ cron: '*/15 * * * *' }]
  }
};
