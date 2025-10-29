import CallMethod from "../../shared/CallMethod";
import Destination from "../../shared/Destination";
import LoginExchange from "./LoginExchange";
import ServerResponse from "../../shared/ServerResponse";
import XQModule from "../XQModule";
import XQSDKv3 from "../XQSDKv3";
import { XQServices } from "../../shared/XQServicesEnum";

import handleException from "../../shared/exceptions/handleException";

/**
 * A service which is utilized to verify the PIN code from the login link email.
 * If successful, this service will automatically proceed to exchange the code for a guest access token.
 *
 * @class [LoginVerify]
 */
export default class LoginVerify extends XQModule {
  /** The required fields of the payload needed to utilize the service */
  requiredFields: string[];

  /** Specified name of the service */
  serviceName: string;

  /** The field name representing the verification code */
  static CODE: "code" = "code";

  /** The field name representing the PIN from email */
  static PIN: "pin" = "pin";

  /**
   * @param {Map} maybePayload - the container for the request parameters supplied to this method.
   * @param {String} maybePayload.code - The code from the login link request (or retrieved from cache).
   * @param {String} maybePayload.pin - The PIN from the email.
   *
   * @returns {Promise<ServerResponse<{}>>} a `ServerResponse` indicating verification status
   */
  supplyAsync: (maybePayload: {
    code?: string;
    pin: string;
  }) => Promise<ServerResponse>;

  constructor(sdk: XQSDKv3) {
    super(sdk);

    this.serviceName = "login/verify";
    this.requiredFields = [LoginVerify.PIN];

    this.supplyAsync = (maybePayload) => {
      try {
        this.sdk.validateInput(maybePayload, this.requiredFields);
        const self = this;

        // Get the code from the payload or retrieve from cache
        const code = maybePayload[LoginVerify.CODE] || this.cache.getDeltaLoginCode();

        if (!code) {
          throw new Error("Login code not found. Please call LoginLink first.");
        }

        const pin = maybePayload[LoginVerify.PIN];

        const verifyPayload = {
          [LoginVerify.CODE]: code,
          [LoginVerify.PIN]: pin,
        };

        return this.sdk
          .call(
            this.sdk.DELTA_SERVER_URL,
            this.serviceName,
            CallMethod.GET,
            null,
            verifyPayload,
            false,
            Destination.DELTA
          )
          .then((response: ServerResponse) => {
            switch (response.status) {
              case ServerResponse.OK: {
                // Verification successful, now exchange for guest access token
                return new LoginExchange(self.sdk).supplyAsync({ code });
              }
              case ServerResponse.ERROR: {
                return handleException(response, XQServices.LoginVerify);
              }
              default: {
                return response;
              }
            }
          });
      } catch (exception) {
        return new Promise((resolve) =>
          resolve(handleException(exception, XQServices.LoginVerify))
        );
      }
    };
  }
}
