import CallMethod from "../CallMethod";
import ServerResponse from "../ServerResponse";
import XQModule from "./XQModule";
import XQSDK from "../XQSDK";
import { XQServices } from "../XQServicesEnum";

import handleException from "../exceptions/handleException";

/**
 * A service which is utilized to update settings of the current user
 * @class [UpdateSettings]
 */
export default class UpdateSettings extends XQModule {
  /** The required fields of the payload needed to utilize the service */
  requiredFields: string[];

  /** Specified name of the service */
  serviceName: string;

  /** The field name which represents the boolean indicating whether the user receive notifications or not */
  static NEWSLETTER: "newsLetter" = "newsLetter";

  /** The field name which the boolean indicating whether the user receive newsletters or not. This is only valid for new users, and is ignored if the user already exists */
  static NOTIFICATIONS: "notifications" = "notifications";

  /**
   *
   * @param {Map} maybePayLoad - Container for the request parameters supplied to this method.
   * @param {boolean} maybePayLoad.newsLetter - the boolean indicating whether the user receive newsletters or not. This is only valid for new users, and is ignored if the user already exists
   * @param {NotificationEnum.options} maybePayLoad.notifications - the boolean indicating whether the user receive notifications or not
   * @returns {Promise<ServerResponse<{}>>}
   */
  supplyAsync: (maybePayload: {
    newsletter: boolean;
    notifications: boolean;
  }) => Promise<ServerResponse>;

  constructor(sdk: XQSDK) {
    super(sdk);

    this.serviceName = "settings";
    this.requiredFields = [];

    this.supplyAsync = (maybePayLoad) => {
      try {
        const accessToken = this.sdk.validateAccessToken();

        const additionalHeaderProperties = {
          Authorization: "Bearer " + accessToken,
        };

        return this.sdk
          .call(
            this.sdk.SUBSCRIPTION_SERVER_URL,
            this.serviceName,
            CallMethod.PATCH,
            additionalHeaderProperties,
            maybePayLoad,
            true
          )
          .then((response: ServerResponse) => {
            switch (response.status) {
              case ServerResponse.OK: {
                return response;
              }
              case ServerResponse.ERROR: {
                return handleException(response, XQServices.UpdateSettings);
              }
            }
          });
      } catch (exception) {
        return new Promise((resolve) =>
          resolve(handleException(exception, XQServices.UpdateSettings))
        );
      }
    };
  }
}
