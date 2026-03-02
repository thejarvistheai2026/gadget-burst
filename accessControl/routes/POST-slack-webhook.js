// Route configuration for POST-slack-webhook
// Makes route accessible without authentication (Slack sends unauthenticated requests)

export const routes = {
  "POST-slack-webhook": {
    public: true
  }
};
