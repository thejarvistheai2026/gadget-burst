import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "session" model, go to https://burst.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v2",
  storageKey: "F3X-V7Oin3Oz",
  fields: {
    user: {
      type: "belongsTo",
      parent: { model: "user" },
      storageKey: "_UbSVaP2Mw6Y",
    },
  },
};
