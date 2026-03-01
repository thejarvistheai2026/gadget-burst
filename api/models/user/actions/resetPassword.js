import { applyParams, save, ActionOptions } from "gadget-server";

// Powers the form in the 'reset password' page

/** @type { ActionRun } */
export const run = async ({ params, record, logger, api, connections }) => {
  // Applies new 'password' to the user record and saves to database
  applyParams(params, record);
  await save(record);
  return {
    result: "ok"
  }
};

/** @type { ActionOnSuccess } */
export const onSuccess = async ({ params, record, logger, api, connections }) => {
  // Your logic goes here
};

/** @type { ActionOptions } */
export const options = {
  actionType: "custom",
  returnType: true,
  triggers: {
    resetPassword: true,
  },
};
