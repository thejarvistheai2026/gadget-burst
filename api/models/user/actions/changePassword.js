import { applyParams, save, ActionOptions } from "gadget-server";

// Powers the form in the 'change password' page

/** @type { ActionRun } */
export const run = async ({ params, record, logger, api, connections }) => {
  // Applies new 'password' to the user record and saves to database
  applyParams(params, record);
  await save(record);
};

/** @type { ActionOnSuccess } */
export const onSuccess = async ({ params, record, logger, api, connections }) => {
  // Your logic goes here
};

/** @type { ActionOptions } */
export const options = {
  actionType: "update",
  triggers: {
    changePassword: true,
  },
};
