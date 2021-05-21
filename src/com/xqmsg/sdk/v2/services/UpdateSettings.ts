import CallMethod from "../CallMethod";
import ServerResponse from "../ServerResponse";
import XQModule, { SupplyAsync } from "./XQModule";
import XQSDK from "../XQSDK";

/**
 * @class [UpdateSettings]
 */
export default class UpdateSettings extends XQModule {
  requiredFields: string[];
  serviceName: string;
  static NEWSLETTER: string;
  static NOTIFICATIONS: string;
  supplyAsync: SupplyAsync;

  constructor(sdk: XQSDK) {
    super(sdk);

    this.serviceName = "settings";
    this.requiredFields = [];

    /**
     *
     * @param {Map} maybePayLoad - Container for the request parameters supplied to this method.
     * @param {boolean} maybePayLoad.newsLetter - Should this user receive newsletters or not? <br>This is only valid for new users, and is ignored if the user already exists.
     * @param {NotificationEnum.options} maybePayLoad.notifications - Specifies the notifications that the user should receive  <br>.

     * @returns {Promise<ServerResponse<{}>>}
     */
    this.supplyAsync = (maybePayLoad) => {
      try {
        let accessToken = this.sdk.validateAccessToken();

        let additionalHeaderProperties = {
          Authorization: "Bearer " + accessToken,
        };

        return this.sdk.call(
          this.sdk.SUBSCRIPTION_SERVER_URL,
          this.serviceName,
          CallMethod.OPTIONS,
          additionalHeaderProperties,
          maybePayLoad,
          true
        );
      } catch (exception) {
        return new Promise((resolve, reject) => {
          resolve(
            new ServerResponse(
              ServerResponse.ERROR,
              exception.code,
              exception.reason
            )
          );
        });
      }
    };
  }
}

UpdateSettings.NOTIFICATIONS = "notifications";
UpdateSettings.NEWSLETTER = "newsletter";
