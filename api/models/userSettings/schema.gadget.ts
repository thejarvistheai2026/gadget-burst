import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "userSettings" model, go to https://burst.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v2",
  storageKey: "yENy2IU8wI8h",
  comment:
    "Stores user-specific settings, such as default BCC email address and Gmail API connection status.",
  fields: {
    fromName: { type: "string", storageKey: "GsXrc4Eqdh6Z" },
    globalBcc: { type: "string", storageKey: "NYbjVkabQRt8" },
    gmailConnected: {
      type: "boolean",
      default: false,
      storageKey: "BCQ6q1cC1Pai",
    },
    gmailEmail: { type: "email", storageKey: "leOu_7G5Dy_K" },
    user: {
      type: "belongsTo",
      validations: { required: true },
      parent: { model: "user" },
      storageKey: "njCYunzJXYCR",
    },
  },
};
