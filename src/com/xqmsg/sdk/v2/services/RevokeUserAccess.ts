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
   * @param {Map} maybePayload - the container for the request parameters supplied to this method.
   * @param {[String]} maybePayload.recipients! - the list of emails of users intended to have read access to the encrypted content removed.<br>
   * @param {String} maybePayload.locatorKey! - thelocator key,  used as a URL to discover the key on  the server.
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
      RevokeUserAccess.RECIPIENTS];

    this.supplyAsync = (maybePayload) => {
      try {
        this.sdk.validateInput(maybePayload, this.requiredFields);
        const accessToken = this.sdk.validateAccessToken();

        const locatorKey = maybePayload[RevokeUserAccess.LOCATOR_KEY];

        const recipients =  maybePayload[RevokeUserAccess.RECIPIENTS];

        const payload = {
          [RevokeUserAccess.RECIPIENTS]:recipients,
        }

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
