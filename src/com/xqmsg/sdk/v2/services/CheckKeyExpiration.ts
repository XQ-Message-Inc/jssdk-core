import CallMethod from "../CallMethod";
import ServerResponse from "../ServerResponse";
import XQModule from "./XQModule";
import XQSDK from "../XQSDK";
import { XQServices } from "../XQServicesEnum";

import handleException from "../exceptions/handleException";

/**
 * A service which is utilized to check whether a particular key is expired or not without actually fetching it.
 *
 * @class [CheckKeyExpiration]
 */
export default class CheckKeyExpiration extends XQModule {
  /** The required fields of the payload needed to utilize the service */
  requiredFields: string[];

  /** Specified name of the service */
  serviceName: string;

  /** The field name representing number of seconds before this token expires.<br>If the token is already expired, this will be 0*/
  static EXPIRES_IN: "expiresOn" = "expiresOn";

  /** The field name representing the key to fetch the encryption key from the server */
  static LOCATOR_KEY: "locatorKey" = "locatorKey";

  /**
   * @param {Map} maybePayload - the container for the request parameters supplied to this method.
   * @param {String} maybePayload.locatorKey- A URL encoded version of the key locator token to fetch the key from the server.
   * @see #encodeURIComponent function encodeURIComponent (built-in since ES-5)
   * @returns {Promise<ServerResponse<{payload:{expiresOn:long}}>>}
   **/
  supplyAsync: (maybePayload: {
    locatorKey: string;
  }) => Promise<ServerResponse>;

  constructor(sdk: XQSDK) {
    super(sdk);

    this.serviceName = "expiration";
    this.requiredFields = [CheckKeyExpiration.LOCATOR_KEY];

    this.supplyAsync = (maybePayload) => {
      try {
        this.sdk.validateInput(maybePayload, this.requiredFields);
        const accessToken = this.sdk.validateAccessToken();

        const locatorKey = maybePayload[CheckKeyExpiration.LOCATOR_KEY];
        const additionalHeaderProperties = {
          Authorization: "Bearer " + accessToken,
        };

        return this.sdk
          .call(
            this.sdk.VALIDATION_SERVER_URL,
            this.serviceName + "/" + encodeURIComponent(locatorKey),
            CallMethod.GET,
            additionalHeaderProperties,
            null,
            true
          )
          .then((response: ServerResponse) => {
            switch (response.status) {
              case ServerResponse.OK: {
                return response;
              }
              case ServerResponse.ERROR: {
                return handleException(response, XQServices.CheckKeyExpiration);
              }
            }
          });
      } catch (exception) {
        return new Promise((resolve) =>
          resolve(handleException(exception, XQServices.CheckKeyExpiration))
        );
      }
    };
  }
}
