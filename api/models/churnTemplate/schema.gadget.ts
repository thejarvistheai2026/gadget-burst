import type { GadgetModel } from "gadget-server";

export const schema: GadgetModel = {
  type: "gadget/model-schema/v2",
  storageKey: "churn-template-v1",
  fields: {
    name: { 
      type: "string", 
      validations: { required: true },
      storageKey: "churn-template-name"
    },
    churnReason: { 
      type: "enum",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["price", "other_solution", "other"],
      validations: { required: true },
      storageKey: "churn-template-reason"
    },
    subject: { 
      type: "string", 
      validations: { required: true },
      storageKey: "churn-template-subject"
    },
    body: { 
      type: "richText", 
      validations: { required: true },
      storageKey: "churn-template-body"
    },
    isActive: { 
      type: "boolean", 
      default: true,
      storageKey: "churn-template-active"
    },
    user: { 
      type: "belongsTo", 
      parent: { model: "user" },
      storageKey: "churn-template-user"
    }
  },
};
