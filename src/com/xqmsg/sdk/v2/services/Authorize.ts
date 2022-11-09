import CallMethod from "../CallMethod";
import ServerResponse from "../ServerResponse";
import XQModule from "./XQModule";
import XQSDK from "../XQSDK";
import { XQServices } from "../XQServicesEnum";

import handleException from "../exceptions/handleException";

/**
 * A service which is used to authorize a user to utilize XQ services.
 * If successful, the service itself will return a pre-authorization token that can be exchanged
 * for a full access token after validation is complete.
 *
 * The user will also receive an email containing:
 *    1. validation PIN - a two-factor authentication token used as input for the `CodeValidator` service
 *    2. validation Link - a two-factor authentication token used as input for the `ExchangeForAccessToken` service
 *
 * The user can then choose to either click the link to complete the process or use the PIN.
 * The pin servers as the input parameter of the `CodeValidator` service
 *
 * Optionally, a user may pass an existing `accessToken` which will allow them to skip the `CodeValidator` step.
 *  @class [Authorize]
 */

export default class Authorize extends XQModule {
  /** The required fields of the payload needed to utilize the service */
  requiredFields: string[];

  /** Specified name of the service */
  serviceName: string;

  /** The field name representing an existing access token */
  static ACCESS_TOKEN: "accessToken" = "accessToken";

  /** if 'pin' is sent the validation email will only have the code and no confirmation button */
  static CODE_TYPE: "codetype" = "codetype";

  /** The field name representing the first name of the user */
  static FIRST_NAME: "firstName" = "firstName";

  /** The field name representing the last name of the user */
  static LAST_NAME: "lastName" = "lastName";

  /** The field name representing the news letter service */
  static NEWSLETTER: "newsLetter" = "newsLetter";

  /** The field name representing the notifications service */
  static NOTIFICATIONS: "notifications" = "notifications";

  /** The field name representing the email of the user */
  static USER: "user" = "user";

  /** The field name representing the text sent to the user's phone */
  static TEXT: "text" = "text";

  /** The field name representing the target that can be interpolated in the text sent to a user's phone */
  static TARGET: "target" = "target";

  /**
   * @param {Map} maybePayload - the container for the request parameters supplied to this method.
   * @param {String} maybePayload.user - Email of the user to be validated.
   * @param {String} [maybePayload.firstName]  - First name of the user.
   * @param {String} [maybePayload.lastName] - Last name of the user.
   * @param {Boolean} [maybePayload.newsLetter=false] - Should the user receive a newsletter.
   * @param {NotificationEnum} [maybePayload.notifications=0] Enum Value to specify Notification Settings
   * @param {String} maybePayload.accessToken - an already generated access token, if valid allows use to bypass authorization.
   * @param {String} maybePayload.text - An interpolated text field when a mobile number is specified. Use $pin to interpolate the pin or $link to interpolate the maybePayload.target
   * @param {String} maybePayload.target - A link that can be interpolated in the maybePayload.text. Used for inviting users by text
   * @param {String} maybePayload.codetype - Codetype. Use 'sms' for inviting users by text.
   *
   * @returns {Promise<ServerResponse<{payload:string}>>}
   */
  supplyAsync: (maybePayload: {
    user: string;
    firstName?: string;
    lastName?: string;
    newsLetter?: boolean;
    notifications?: number;
    accessToken?: string;
    text?: string;
    target?: string;
    codetype?: string;
  }) => Promise<ServerResponse>;

  constructor(sdk: XQSDK) {
    super(sdk);

    this.serviceName = "authorize";
    this.requiredFields = [Authorize.USER];

    this.supplyAsync = (maybePayload) => {
      try {
        const self = this;
        this.sdk.validateInput(maybePayload, this.requiredFields);
        const user = maybePayload[Authorize.USER];
        const existingAccessToken = maybePayload[Authorize.ACCESS_TOKEN];

        if (existingAccessToken) {
          self.cache.putActiveProfile(user);
          self.cache.putXQAccess(user, existingAccessToken);

          return new Promise((resolve) => {
            resolve(
              new ServerResponse(ServerResponse.OK, 200, {
                accessToken: existingAccessToken,
                user,
              })
            );
          });
        }

        return this.sdk
          .call(
            this.sdk.SUBSCRIPTION_SERVER_URL,
            this.serviceName,
            CallMethod.POST,
            null,
            maybePayload,
            true
          )
          .then((response: ServerResponse) => {
            switch (response.status) {
              case ServerResponse.OK: {
                const temporaryAccessToken = response.payload;
                self.cache.putXQPreAuthToken(user, temporaryAccessToken);
                return response;
              }
              case ServerResponse.ERROR: {
                return handleException(response, XQServices.Authorize);
              }
            }
          });
      } catch (exception) {
        return new Promise((resolve) =>
          resolve(handleException(exception, XQServices.Authorize))
        );
      }
    };
  }
}
