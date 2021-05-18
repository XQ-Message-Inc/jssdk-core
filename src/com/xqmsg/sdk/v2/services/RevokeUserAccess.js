import XQModule from "./XQModule.js";
import CallMethod from "./../CallMethod.js";
import ServerResponse from "../ServerResponse.js";

/**
 * This service will revoke access to keys for specific recipients without revoking the entire token.
 *
 * @class [RevokeUserAccess]
 */
export default class RevokeUserAccess extends XQModule {
  constructor(sdk) {
    super(sdk);

    this.serviceName = "revoke";
    this.requiredFields = [
      RevokeUserAccess.RECIPIENTS,
      RevokeUserAccess.LOCATOR_KEY,
    ];

    /**
     * @param {Map} maybePayLoad - Container for the request parameters supplied to this method.
     * @param {[String]} maybePayLoad.recipients! - List of emails of users intended to have read access to the encrypted content removed.<br>
     * @param {String} maybePayLoad.locatorToken! - The  locator token,  used as a URL to discover the key on  the server.
     *                                               The URL encoding part is handled internally in the service itself
     * @see #encodeURIComponent function encodeURIComponent (built-in since ES-5)
     * @returns {Promise<ServerResponse<{}>>}
     */
    this.supplyAsync = (maybePayLoad) => {
      try {
        this.sdk.validateInput(maybePayLoad, this.requiredFields);
        let accessToken = this.sdk.validateAccessToken();

        let locatorKey = maybePayLoad[RevokeUserAccess.LOCATOR_KEY];
        maybePayLoad[RevokeUserAccess.RECIPIENTS] =
          maybePayLoad[RevokeUserAccess.RECIPIENTS].join(",");

        let additionalHeaderProperties = {
          Authorization: "Bearer " + accessToken,
        };

        return this.sdk.call(
          this.sdk.VALIDATION_SERVER_URL,
          this.serviceName + "/" + encodeURIComponent(locatorKey),
          CallMethod.OPTIONS,
          additionalHeaderProperties,
          maybePayLoad,
          true
        );
      } catch (validationException) {
        return new Promise((resolve, reject) => {
          resolve(
            new ServerResponse(
              ServerResponse.ERROR,
              validationException.code,
              validationException.reason
            )
          );
        });
      }
    };
  }
}

RevokeUserAccess.LOCATOR_KEY = "locatorKey";
RevokeUserAccess.RECIPIENTS = "recipients";
