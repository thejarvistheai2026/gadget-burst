import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "burst" model, go to https://burst.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v2",
  storageKey: "UigSwEX9K_pY",
  fields: {
    contacts: {
      type: "hasManyThrough",
      sibling: { model: "contact", relatedField: "bursts" },
      join: {
        model: "enrollment",
        belongsToSelfField: "burst",
        belongsToSiblingField: "contact",
      },
      storageKey: "2nXcTWLhJK7q::4QRIYN1-aY08",
    },
    createdDate: {
      type: "dateTime",
      includeTime: true,
      validations: { required: true },
      storageKey: "OpxiADlLCUBw::_zuE_ETarDR4",
    },
    emailTemplates: {
      type: "hasMany",
      children: { model: "emailTemplate", belongsToField: "burst" },
      storageKey: "04bFZjWGFjyL::XVwEGbQngukS",
    },
    name: {
      type: "string",
      validations: { required: true },
      storageKey: "pi_Wpd6htveJ::dUNGXzDx6mAl",
    },
    numberOfEnrolledContacts: {
      type: "number",
      validations: { required: true },
      storageKey: "uwwRO8ereFuu::-XC8EWI_5RYE",
    },
    status: {
      type: "enum",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["Active", "Paused", "Draft"],
      validations: { required: true },
      storageKey: "AKNQ-xHIOXZ0::GMCCQEsThNgZ",
    },
    user: {
      type: "belongsTo",
      parent: { model: "user" },
      storageKey: "UigSwEX9K_pY-BelongsTo-User",
    },
  },
};
