import CallMethod from "../CallMethod";
import ServerResponse from "../ServerResponse";
import XQModule from "./XQModule";
import XQSDK from "../XQSDK";

/**
 * A service which is utilized request an access token when given an email address.
 * If successful, the service itself will return a pre-authorization token that can be exchanged
 * for a full access token after validation is complete.
 *
 * The user will also receive an email containing:
 *    1. validation PIN - a two-factor authentication token used as input for the `CodeValidator` service
 *    2. validation Link - a two-factor authentication token used as input for the `ExchangeForAccessToken` service
 *
 * The user can then choose to either click the link to complete the process or use the PIN.
 * The pin servers as the input parameter of the `CodeValidator` service
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

  /**
   * @param {Map} maybePayLoad - Container for the request parameters supplied to this method.
   * @param {String} maybePayLoad.user - Email of the user to be validated.
   * @param {String} [maybePayLoad.firstName]  - First name of the user.
   * @param {String} [maybePayLoad.lastName] - Last name of the user.
   * @param {Boolean} [maybePayLoad.newsLetter=false] - Should the user receive a newsletter.
   * @param {NotificationEnum} [maybePayLoad.notifications=0] Enum Value to specify Notification Settings
   * @param {String} maybePayLoad.accessToken - an already generated access token, if valid allows use to bypass authorization.
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
  }) => Promise<ServerResponse>;

  constructor(sdk: XQSDK) {
    super(sdk);

    this.serviceName = "authorize";
    this.requiredFields = [Authorize.USER];

    this.supplyAsync = (maybePayLoad) => {
      try {
        const self = this;
        this.sdk.validateInput(maybePayLoad, this.requiredFields);
        const user = maybePayLoad[Authorize.USER];
        const existingAccessToken = maybePayLoad[Authorize.ACCESS_TOKEN];

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
            maybePayLoad,
            true
          )
          .then((response: ServerResponse) => {
            switch (response.status) {
              case ServerResponse.OK: {
                const temporaryAccessToken = response.payload;
                self.cache.putXQPreAuthToken(user, temporaryAccessToken);
                self.cache.putActiveProfile(user);
                return response;
              }
              default: {
                return response;
              }
            }
          });
      } catch (exception) {
        return new Promise((resolve) => {
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
