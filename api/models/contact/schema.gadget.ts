import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "contact" model, go to https://burst.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v2",
  storageKey: "ydYs0ORa6phE",
  fields: {
    bursts: {
      type: "hasManyThrough",
      sibling: { model: "burst", relatedField: "contacts" },
      join: {
        model: "enrollment",
        belongsToSelfField: "contact",
        belongsToSiblingField: "burst",
      },
      storageKey: "71Ufoykoszk9::uKfEZHt56NHd",
    },
    company: { type: "string", storageKey: "FufvrhPICUkY" },
    email: {
      type: "email",
      validations: { required: true, unique: true },
      storageKey: "33wgCVmWwy1m::34fe5sjAT4E8",
    },
    enrollmentDate: {
      type: "dateTime",
      includeTime: true,
      validations: { required: true },
      storageKey: "S_XRx6DDDggn::XH8kF8LxHdox",
    },
    firstName: { type: "string", storageKey: "SSO3uLI-LVAW" },
    name: {
      type: "string",
      storageKey: "GjuB93pO7Gep::OXB63iMM8FOQ",
    },
    sentEmails: {
      type: "hasMany",
      children: { model: "sentEmail", belongsToField: "contact" },
      storageKey: "MzchBMBEYqA2",
    },
    status: {
      type: "enum",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["Active", "Replied"],
      validations: { required: true },
      storageKey: "VvUln6PELd9O::QBu5HxyFjbvH",
    },
    user: {
      type: "belongsTo",
      parent: { model: "user" },
      storageKey: "ydYs0ORa6phE-BelongsTo-User",
    },
  },
};
