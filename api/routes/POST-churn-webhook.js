/** @type { import("gadget-server").RouteHandler } */
const route = async ({ request, reply, api, logger }) => {
  // Handle Slack challenge verification FIRST (before any validation)
  if (request.body?.challenge) {
    return reply.send({ challenge: request.body.challenge });
  }

  try {
    const {
      accountName,
      accountEmail,
      company,
      churnReason,
      slackMessageId,
      slackThreadId,
      slackChannelId,
      slackBotToken,
      mrr,
      planTier,
      previousPlan,
      churnDate,
    } = request.body;

    const params = {
      accountName,
      accountEmail,
      churnReason,
      slackMessageId,
      churnDate,
    };

    if (company !== undefined) params.company = company;
    if (slackThreadId !== undefined) params.slackThreadId = slackThreadId;
    if (slackChannelId !== undefined) params.slackChannelId = slackChannelId;
    if (slackBotToken !== undefined) params.slackBotToken = slackBotToken;
    if (mrr !== undefined) params.mrr = mrr;
    if (planTier !== undefined) params.planTier = planTier;
    if (previousPlan !== undefined) params.previousPlan = previousPlan;

    const result = await api.receiveChurnWebhook(params);

    await reply.code(200).send({ success: true, result });
  } catch (error) {
    logger.error({ error }, "Error processing churn webhook");
    await reply.code(500).send({ success: false, error: error.message });
  }
};

route.options = {
  cors: {
    origin: true,
  },
  // Remove body schema validation - handle manually
};

export default route;
