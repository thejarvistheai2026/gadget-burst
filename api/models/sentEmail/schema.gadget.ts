import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "sentEmail" model, go to https://burst.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v2",
  storageKey: "sJmdbECp3EDg",
  comment:
    "Represents an email that has been sent, tracking its status, recipient, and associated enrollment and burst",
  fields: {
    burst: {
      type: "belongsTo",
      validations: { required: true },
      parent: { model: "burst" },
      storageKey: "ngACbGQ_5OfL",
    },
    contact: {
      type: "belongsTo",
      validations: { required: true },
      parent: { model: "contact" },
      storageKey: "eobWJuVlRz7X",
    },
    emailTemplate: {
      type: "belongsTo",
      validations: { required: true },
      parent: { model: "emailTemplate" },
      storageKey: "4bdP3o6g06hY",
    },
    enrollment: {
      type: "belongsTo",
      validations: { required: true },
      parent: { model: "enrollment" },
      storageKey: "6M-aIvrr-Fkt",
    },
    errorMessage: { type: "string", storageKey: "EGLDfFEIUn75" },
    messageId: { type: "string", storageKey: "cu6YWNxwv8OY" },
    sentAt: {
      type: "dateTime",
      includeTime: true,
      validations: { required: true },
      storageKey: "9XUY6m7F10w3",
    },
    status: {
      type: "enum",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["sent", "failed"],
      validations: { required: true },
      storageKey: "do0FAolJ9Q8N",
    },
    subject: {
      type: "string",
      validations: { required: true },
      storageKey: "h7uXrT9BUnqI",
    },
    user: {
      type: "belongsTo",
      validations: { required: true },
      parent: { model: "user" },
      storageKey: "3XkrrMEAc_ba",
    },
  },
};
