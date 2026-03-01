import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "user" model, go to https://burst.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v2",
  storageKey: "DataModel-AppAuth-User",
  fields: {
    email: {
      type: "email",
      validations: { required: true, unique: true },
      storageKey: "DlAbPOOkPBq3",
    },
    emailVerificationToken: {
      type: "string",
      storageKey: "bmASyt-JoO5D",
    },
    emailVerificationTokenExpiration: {
      type: "dateTime",
      includeTime: true,
      storageKey: "L1fTcK6CQ5t2",
    },
    emailVerified: {
      type: "boolean",
      default: false,
      storageKey: "zP5CfB33OVLJ",
    },
    firstName: { type: "string", storageKey: "GBvscWaDDnAm" },
    googleImageUrl: { type: "url", storageKey: "eOHIfF6XzRvD" },
    googleProfileId: { type: "string", storageKey: "DGrgNwQgIxLE" },
    lastName: { type: "string", storageKey: "vSS0tulWhO6S" },
    lastSignedIn: {
      type: "dateTime",
      includeTime: true,
      storageKey: "fFsWR1Lr5_AL",
    },
    password: {
      type: "password",
      validations: { strongPassword: true },
      storageKey: "Z9NJcFJqtqmw",
    },
    profilePicture: {
      type: "file",
      allowPublicAccess: true,
      storageKey: "0FRsGX-JOsGr",
    },
    resetPasswordToken: {
      type: "string",
      storageKey: "uvtsIDQgHXbl",
    },
    resetPasswordTokenExpiration: {
      type: "dateTime",
      includeTime: true,
      storageKey: "6PGIkPkUItSv",
    },
    roles: {
      type: "roleList",
      default: ["unauthenticated"],
      storageKey: "ZTvbUztEjnW4",
    },
  },
};
