import CallMethod from "../CallMethod";
import ServerResponse from "../ServerResponse";
import XQSDK from "../XQSDK";
import XQModule, { SupplyAsync } from "./XQModule";

/**
 *
 * Gets the notification and newsletter settings for the current user.
 *
 * @class [GetSettings]
 */
export default class GetSettings extends XQModule {
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
     * @param {{}} [maybePayLoad=null]
     * @returns {Promise<ServerResponse<{payload:{notifications:NotificationEnum.options, newsLetter:boolean}}>>}
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
          CallMethod.GET,
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

/**Specifies the  notifications that the user should receive  */
GetSettings.NOTIFICATIONS = "notifications";
/**Should this user receive newsletters or not? <br>This is only valid for new users, and is ignored if the user already exists.*/
GetSettings.NEWSLETTER = "newsletter";
