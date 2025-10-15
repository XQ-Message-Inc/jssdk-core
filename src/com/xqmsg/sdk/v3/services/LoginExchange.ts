import CallMethod from "../../shared/CallMethod";
import Destination from "../../shared/Destination";
import ServerResponse from "../../shared/ServerResponse";
import XQModule from "../XQModule";
import XQSDKv3 from "../XQSDKv3";
import { XQServices } from "../../shared/XQServicesEnum";

import handleException from "../../shared/exceptions/handleException";

/**
 * A service which is utilized to exchange a validated login code for a guest access token.
 * The guest access token can be used to retrieve registered teams and switch to a specific team.
 *
 * @class [LoginExchange]
 */
export default class LoginExchange extends XQModule {
  /** The required fields of the payload needed to utilize the service */
  requiredFields: string[];

  /** Specified name of the service */
  serviceName: string;

  /** The field name representing the verification code */
  static CODE: "code" = "code";

  /**
   * @param {Map} maybePayload - the container for the request parameters supplied to this method.
   * @param {String} [maybePayload.code] - The code from the login link request (or retrieved from cache).
   *
   * @returns {Promise<ServerResponse<{payload:string}>>} a `ServerResponse` containing the guest access token
   */
  supplyAsync: (maybePayload?: {
    code?: string;
  }) => Promise<ServerResponse>;

  constructor(sdk: XQSDKv3) {
    super(sdk);

    this.serviceName = "login/exchange";
    this.requiredFields = [];

    this.supplyAsync = (maybePayload = {}) => {
      try {
        this.sdk.validateInput(maybePayload, this.requiredFields);
        const self = this;

        // Get the code from the payload or retrieve from cache
        const code = maybePayload[LoginExchange.CODE] || this.cache.getDeltaLoginCode();

        if (!code) {
          throw new Error("Login code not found. Please call LoginLink and LoginVerify first.");
        }

        const exchangePayload = {
          [LoginExchange.CODE]: code,
        };

        return this.sdk
          .call(
            this.sdk.DELTA_SERVER_URL,
            this.serviceName,
            CallMethod.GET,
            null,
            exchangePayload,
            true,
            Destination.DELTA
          )
          .then((response: ServerResponse) => {
            switch (response.status) {
              case ServerResponse.OK: {
                let responseData = response.payload;

                // Parse JSON string if needed
                if (typeof responseData === "string") {
                  try {
                    const parsed = JSON.parse(responseData);
                    responseData = parsed;
                  } catch (e) {
                    // If it's just a plain token string, use it as-is
                    console.log("Response is a plain string token");
                  }
                }

                // Extract guest access token from response
                const guestAccessToken = 
                  typeof responseData === "string" 
                    ? responseData 
                    : responseData?.access_token || responseData?.accessToken;

                if (guestAccessToken) {
                  // Store the guest access token
                  self.cache.putDeltaGuestAccess(guestAccessToken);
                  // Clear the login code as it's no longer needed
                  self.cache.removeDeltaLoginCode();
                }

                return response;
              }
              case ServerResponse.ERROR: {
                return handleException(response, XQServices.LoginExchange);
              }
              default: {
                return response;
              }
            }
          });
      } catch (exception) {
        return new Promise((resolve) =>
          resolve(handleException(exception, XQServices.LoginExchange))
        );
      }
    };
  }
}
