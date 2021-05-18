import XQModule from "./XQModule.js";
import CallMethod from "./../CallMethod.js";
import ServerResponse from "../ServerResponse.js";

/**
 * Revokes a key using its token.
 * Only the user who sent the message will be able to revoke it.
 *
 * @class [RevokeKeyAccess]
 */
export default class RevokeKeyAccess extends XQModule {
  constructor(sdk) {
    super(sdk);

    this.serviceName = "key";
    this.requiredFields = [RevokeKeyAccess.LOCATOR_KEY];

    /**
     * @param {Map} maybePayLoad - Container for the request parameters supplied to this method.
     * @param {[String]} maybePayLoad.locatorToken - The  locator token,  used as a URL to discover the key on  the server.]
     *                 The URL encoding part is handled internally in the service itself
     * @see #encodeURIComponent function encodeURIComponent (built-in since ES-5)
     * @returns {Promise<ServerResponse<{}>>}
     */
    this.supplyAsync = (maybePayLoad) => {
      try {
        this.sdk.validateInput(maybePayLoad, this.requiredFields);
        let accessToken = this.sdk.validateAccessToken();
        let locatorKey = maybePayLoad[RevokeKeyAccess.LOCATOR_KEY];

        let additionalHeaderProperties = {
          Authorization: "Bearer " + accessToken,
        };

        return this.sdk.call(
          this.sdk.VALIDATION_SERVER_URL,
          this.serviceName + "/" + encodeURIComponent(locatorKey),
          CallMethod.OPTIONS,
          additionalHeaderProperties,
          null,
          true
        );
      } catch (exception) {
        return new Promise((resolve, reject) => {
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

RevokeKeyAccess.LOCATOR_KEY = "locatorKey";
