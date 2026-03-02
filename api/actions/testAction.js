// Minimal test action
/** @type { ActionRun } */
export const run = async ({ params }) => {
  console.log("Test action received:", params);
  return { status: "ok", received: params };
};
