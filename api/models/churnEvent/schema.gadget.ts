import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "churnEvent" model, go to https://burst.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v2",
  storageKey: "churn-event-v1",
  fields: {
    accountEmail: {
      type: "email",
      validations: { required: true },
      storageKey: "churn-event-account-email",
    },
    accountName: {
      type: "string",
      validations: { required: true },
      storageKey: "churn-event-account-name",
    },
    churnDate: {
      type: "dateTime",
      includeTime: true,
      validations: { required: true },
      storageKey: "churn-event-date",
    },
    churnReason: {
      type: "enum",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: [
        "price",
        "other_solution",
        "other",
        "account_deleted",
        "subscription_deleted",
        "charge_failed",
        "downgrade",
        "missingIntegration",
        "tooComplex",
      ],
      validations: { required: true },
      storageKey: "churn-event-reason",
    },
    company: { type: "string", storageKey: "churn-event-company" },
    emailSent: {
      type: "boolean",
      default: true,
      storageKey: "churn-event-email-sent",
    },
    emailStatus: {
      type: "enum",
      default: "pending",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["pending", "sent", "failed", "skipped"],
      storageKey: "churn-event-email-status",
    },
    mrr: { type: "number", storageKey: "churn-event-mrr" },
    notificationType: {
      type: "enum",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: [
        "account_deleted",
        "subscription_deleted",
        "subscription_updated",
        "charge_failed",
        "invoice_paid",
        "payment_method_removed",
      ],
      storageKey: "churn-event-notification-type",
    },
    planTier: { type: "string", storageKey: "churn-event-plan-tier" },
    previousPlan: {
      type: "string",
      storageKey: "churn-event-previous-plan",
    },
    rawSlackData: {
      type: "json",
      storageKey: "churn-event-raw-data",
    },
    sentAt: {
      type: "dateTime",
      includeTime: true,
      storageKey: "churn-event-sent-at",
    },
    slackChannelId: {
      type: "string",
      storageKey: "churn-event-slack-channel-id",
    },
    slackMessageId: {
      type: "string",
      validations: { unique: true },
      storageKey: "churn-event-slack-id",
    },
    slackThreadId: {
      type: "string",
      storageKey: "churn-event-slack-thread-id",
    },
    user: {
      type: "belongsTo",
      parent: { model: "user" },
      storageKey: "churn-event-user",
    },
  },
};
