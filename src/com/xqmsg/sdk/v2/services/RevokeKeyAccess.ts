import CallMethod from "../CallMethod";
import ServerResponse from "../ServerResponse";
import XQModule from "./XQModule";
import XQSDK from "../XQSDK";
import { XQServices } from "../XQServicesEnum";

import handleException from "../exceptions/handleException";

/**
 * A service which is utilized to revoke a key using a locator token.
 * Only the user who sent the message will be able to revoke it.
 *
 * @class [RevokeKeyAccess]
 */
export default class RevokeKeyAccess extends XQModule {
  /** The required fields of the payload needed to utilize the service */
  requiredFields: string[];

  /** Specified name of the service */
  serviceName: string;

  /** The field name representing the locator key */
  static LOCATOR_KEYS: "locatorKeys" = "locatorKeys";

  /**
   * @param {Map} maybePayLoad - Container for the request parameters supplied to this method.
   * @param {[String]} maybePayLoad.locatorKey - the locator key used as a URL to discover the key on the server.
   * The URL encoding part is handled internally in the service itself
   * @see #encodeURIComponent function encodeURIComponent (built-in since ES-5)
   * @returns {Promise<ServerResponse<{}>>}
   */
  supplyAsync: (maybePayload: {
    locatorKeys: string[];
  }) => Promise<ServerResponse>;

  constructor(sdk: XQSDK) {
    super(sdk);

    this.serviceName = "key";
    this.requiredFields = [RevokeKeyAccess.LOCATOR_KEYS];

    this.supplyAsync = (maybePayLoad) => {
      try {
        this.sdk.validateInput(maybePayLoad, this.requiredFields);
        const accessToken = this.sdk.validateAccessToken();
        const locatorKeys = maybePayLoad[RevokeKeyAccess.LOCATOR_KEYS];

        const additionalHeaderProperties = {
          Authorization: "Bearer " + accessToken,
        };

        return this.sdk
          .call(
            this.sdk.VALIDATION_SERVER_URL,
            this.serviceName,
            CallMethod.DELETE,
            additionalHeaderProperties,
            { tokens: locatorKeys },
            true
          )
          .then((response: ServerResponse) => {
            switch (response.status) {
              case ServerResponse.OK: {
                return response;
              }
              case ServerResponse.ERROR: {
                return handleException(response, XQServices.RevokeKeyAccess);
              }
            }
          });
      } catch (exception) {
        return new Promise((resolve) =>
          resolve(handleException(exception, XQServices.RevokeKeyAccess))
        );
      }
    };
  }
}
