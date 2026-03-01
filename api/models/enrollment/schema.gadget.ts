import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "enrollment" model, go to https://burst.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v2",
  storageKey: "3wjaTKWwmhcU",
  fields: {
    burst: {
      type: "belongsTo",
      parent: { model: "burst" },
      storageKey: "N12LTAvLtjS0::tJOllbtEOFAf",
    },
    contact: {
      type: "belongsTo",
      parent: { model: "contact" },
      storageKey: "ozIuJZPUzMRv::ND7UIU9i116-",
    },
    enrolledAt: {
      type: "dateTime",
      includeTime: true,
      validations: { required: true },
      storageKey: "t5qkLteAcyVc::pBMILfsgLhKR",
    },
    user: {
      type: "belongsTo",
      parent: { model: "user" },
      storageKey: "3wjaTKWwmhcU-BelongsTo-User",
    },
  },
};
