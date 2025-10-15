import CallMethod from "../../shared/CallMethod";
import Destination from "../../shared/Destination";
import ServerResponse from "../../shared/ServerResponse";
import XQModule from "../XQModule";
import XQSDKv3 from "../XQSDKv3";
import { XQServices } from "../../shared/XQServicesEnum";

import handleException from "../../shared/exceptions/handleException";

/**
 * A service which is used to request a login link for Delta API v3 authentication.
 * If successful, the user will receive an email containing a PIN and validation code.
 * The service will return a code that can be used in subsequent authentication steps.
 *
 * @class [LoginLink]
 */
export default class LoginLink extends XQModule {
  /** The required fields of the payload needed to utilize the service */
  requiredFields: string[];

  /** Specified name of the service */
  serviceName: string;

  /** The field name representing the email of the user */
  static EMAIL: "email" = "email";

  /** The field name representing the code type */
  static CODE_TYPE: "codetype" = "codetype";

  /**
   * @param {Map} maybePayload - the container for the request parameters supplied to this method.
   * @param {String} maybePayload.email - Email of the user to be validated.
   * @param {String} [maybePayload.codetype='link'] - Type of code to send ('link', 'pin', or 'sms').
   *
   * @returns {Promise<ServerResponse<{payload:string}>>} a `ServerResponse` containing the login code
   */
  supplyAsync: (maybePayload: {
    email: string;
    codetype?: string;
  }) => Promise<ServerResponse>;

  constructor(sdk: XQSDKv3) {
    super(sdk);

    this.serviceName = "login/link";
    this.requiredFields = [LoginLink.EMAIL];

    this.supplyAsync = (maybePayload) => {
      try {
        const self = this;
        this.sdk.validateInput(maybePayload, this.requiredFields);

        const email = maybePayload[LoginLink.EMAIL];
        const codetype = maybePayload[LoginLink.CODE_TYPE] || "link";

        const payload = {
          [LoginLink.EMAIL]: email,
          [LoginLink.CODE_TYPE]: codetype,
        };

        return this.sdk
          .call(
            this.sdk.DELTA_SERVER_URL,
            this.serviceName,
            CallMethod.POST,
            null,
            payload,
            true,
            Destination.DELTA
          )
          .then((response: ServerResponse) => {
            switch (response.status) {
              case ServerResponse.OK: {
                // Extract the code from the response payload
                let responseData = response.payload;
                let loginCode: string | null = null;
                
                // If the payload is a JSON string, parse it first
                if (typeof responseData === "string") {
                  try {
                    const parsed = JSON.parse(responseData);
                    if (parsed && typeof parsed === "object" && parsed.code) {
                      loginCode = parsed.code;
                    } else {
                      // If it's just a plain string (not JSON), use it directly
                      loginCode = responseData;
                    }
                  } catch (e) {
                    // Not valid JSON, use as-is
                    loginCode = responseData;
                  }
                } else if (responseData && typeof responseData === "object") {
                  // If it's already an object, extract the code property
                  loginCode = (responseData as any).code;
                }

                if (loginCode) {
                  self.cache.putDeltaLoginCode(loginCode);
                  self.cache.putActiveProfile(email);
                }

                return response;
              }
              case ServerResponse.ERROR: {
                return handleException(response, XQServices.LoginLink);
              }
              default: {
                return response;
              }
            }
          });
      } catch (exception) {
        return new Promise((resolve) =>
          resolve(handleException(exception, XQServices.LoginLink))
        );
      }
    };
  }
}
