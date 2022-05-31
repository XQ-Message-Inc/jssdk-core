import CallMethod from "../CallMethod";
import ServerResponse from "../ServerResponse";
import XQModule from "./XQModule";
import XQSDK from "../XQSDK";
import { XQServices } from "../XQServicesEnum";

import handleException from "../exceptions/handleException";

/**
 * A service which is utilized to revoke access to keys for specific recipients without revoking the entire token.
 *
 * @class [RevokeUserAccess]
 */
export default class RevokeUserAccess extends XQModule {
  /** The required fields of the payload needed to utilize the service */
  requiredFields: string[];

  /** Specified name of the service */
  serviceName: string;

  /** The field name representing the list of emails of users intended to have read access to the encrypted content */
  static RECIPIENTS: "recipients" = "recipients";

  /** The field name representing the locator key */
  static LOCATOR_KEY: "locatorKey" = "locatorKey";

  /**
   * @param {Map} maybePayLoad - Container for the request parameters supplied to this method.
   * @param {[String]} maybePayLoad.recipients! - the list of emails of users intended to have read access to the encrypted content removed.<br>
   * @param {String} maybePayLoad.locatorKey! - thelocator key,  used as a URL to discover the key on  the server.
   * The URL encoding part is handled internally in the service itself
   * @see #encodeURIComponent function encodeURIComponent (built-in since ES-5)
   * @returns {Promise<ServerResponse<{}>>}
   */
  supplyAsync: (maybePayload: {
    recipients: string[];
    locatorKey: string;
  }) => Promise<ServerResponse>;

  constructor(sdk: XQSDK) {
    super(sdk);

    this.serviceName = "revoke";
    this.requiredFields = [
      RevokeUserAccess.RECIPIENTS,
      RevokeUserAccess.LOCATOR_KEY,
    ];

    this.supplyAsync = (maybePayLoad) => {
      try {
        this.sdk.validateInput(maybePayLoad, this.requiredFields);
        const accessToken = this.sdk.validateAccessToken();

        const locatorKey = maybePayLoad[RevokeUserAccess.LOCATOR_KEY];

        const flattenedRecipientList =
          maybePayLoad[RevokeUserAccess.RECIPIENTS].join(",");

        const payload = {
          ...maybePayLoad,
          [RevokeUserAccess.RECIPIENTS]: flattenedRecipientList,
        };

        const additionalHeaderProperties = {
          Authorization: "Bearer " + accessToken,
        };

        return this.sdk
          .call(
            this.sdk.VALIDATION_SERVER_URL,
            this.serviceName + "/" + encodeURIComponent(locatorKey),
            CallMethod.PATCH,
            additionalHeaderProperties,
            payload,
            true
          )
          .then((response: ServerResponse) => {
            switch (response.status) {
              case ServerResponse.OK: {
                return response;
              }
              case ServerResponse.ERROR: {
                return handleException(response, XQServices.RevokeUserAccess);
              }
            }
          });
      } catch (exception) {
        return new Promise((resolve) =>
          resolve(handleException(exception, XQServices.RevokeUserAccess))
        );
      }
    };
  }
}
