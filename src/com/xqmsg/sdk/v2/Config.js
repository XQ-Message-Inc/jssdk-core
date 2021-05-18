/**
 * @class [Config]
 */
export default class Config {
  constructor() {
    this.application = {
      XQ_API_KEY: "",
      SUBSCRIPTION_SERVER_URL: "https://subscription.xqmsg.net/v2",
      VALIDATION_SERVER_URL: "https://validation.xqmsg.net/v2",
      KEY_SERVER_URL: "https://quantum.xqmsg.net/v2/",
      DASHBOARD_API_KEY: "YOUR_DASHBOARD_API_KEY",
      DASHBOARD_SERVER_URL: "https://dashboard.xqmsg.net/v2",
    };
  }
}
