import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "emailTemplate" model, go to https://burst.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v2",
  storageKey: "3ahGR3IrXeB6",
  fields: {
    body: {
      type: "richText",
      validations: { required: true },
      storageKey: "fFfaHpjJI3Af::VMWDIp9a1Awx",
    },
    burst: {
      type: "belongsTo",
      parent: { model: "burst" },
      storageKey: "mu0IqVq1fyET::ZXNKeIsG6vQJ",
    },
    delayOffset: {
      type: "number",
      validations: { required: true },
      storageKey: "rK4SEvFcNKdd::VhjtVphw6nTq",
    },
    subject: {
      type: "string",
      validations: { required: true },
      storageKey: "AOxwtcFdaLiK::VOaAZE3fqKmg",
    },
    user: {
      type: "belongsTo",
      parent: { model: "user" },
      storageKey: "3ahGR3IrXeB6-BelongsTo-User",
    },
  },
};
