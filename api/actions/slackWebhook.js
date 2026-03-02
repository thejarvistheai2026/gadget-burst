// POST api/actions/slackWebhook
// Receives Slack events

export const run = async ({ params }) => {
  console.log("Slack webhook:", params);
  
  // Handle Slack challenge
  if (params.challenge) {
    return { challenge: params.challenge };
  }
  
  return { status: "ok" };
};
