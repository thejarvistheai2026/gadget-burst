import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "churnTemplate" model, go to https://burst.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v2",
  storageKey: "churn-template-v1",
  fields: {
    body: {
      type: "richText",
      validations: { required: true },
      storageKey: "churn-template-body",
    },
    churnReason: {
      type: "enum",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: [
        "price",
        "other_solution",
        "other",
        "missingIntegration",
        "tooComplex",
      ],
      validations: { required: true },
      storageKey: "churn-template-reason",
    },
    isActive: {
      type: "boolean",
      default: true,
      storageKey: "churn-template-active",
    },
    name: {
      type: "string",
      validations: { required: true },
      storageKey: "churn-template-name",
    },
    subject: {
      type: "string",
      validations: { required: true },
      storageKey: "churn-template-subject",
    },
    user: {
      type: "belongsTo",
      parent: { model: "user" },
      storageKey: "churn-template-user",
    },
  },
};
