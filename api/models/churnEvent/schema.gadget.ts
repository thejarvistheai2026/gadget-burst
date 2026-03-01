import type { GadgetModel } from "gadget-server";

export const schema: GadgetModel = {
  type: "gadget/model-schema/v2",
  storageKey: "churn-event-v1",
  fields: {
    accountName: { 
      type: "string", 
      validations: { required: true },
      storageKey: "churn-event-account-name"
    },
    accountEmail: { 
      type: "email", 
      validations: { required: true },
      storageKey: "churn-event-account-email"
    },
    company: { 
      type: "string",
      storageKey: "churn-event-company"
    },
    churnReason: { 
      type: "enum", 
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["price", "other_solution", "other"],
      validations: { required: true },
      storageKey: "churn-event-reason"
    },
    churnDate: { 
      type: "dateTime", 
      includeTime: true, 
      validations: { required: true },
      storageKey: "churn-event-date"
    },
    slackMessageId: { 
      type: "string", 
      validations: { unique: true },
      storageKey: "churn-event-slack-id"
    },
    emailSent: { 
      type: "boolean", 
      default: true,
      storageKey: "churn-event-email-sent"
    },
    emailStatus: { 
      type: "enum",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false, 
      options: ["pending", "sent", "failed"],
      default: "pending",
      storageKey: "churn-event-email-status"
    },
    sentAt: { 
      type: "dateTime", 
      includeTime: true,
      storageKey: "churn-event-sent-at"
    },
    user: { 
      type: "belongsTo", 
      parent: { model: "user" },
      storageKey: "churn-event-user"
    }
  },
};
