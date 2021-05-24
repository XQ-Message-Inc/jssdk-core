import CallMethod from "../CallMethod";
import ServerResponse from "../ServerResponse";
import XQModule from "./XQModule";
import XQSDK from "../XQSDK";

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
  static LOCATOR_KEY: "locatorKey";

  /**
   * @param {Map} maybePayLoad - Container for the request parameters supplied to this method.
   * @param {[String]} maybePayLoad.locatorKey - the locator key used as a URL to discover the key on the server.
   * The URL encoding part is handled internally in the service itself
   * @see #encodeURIComponent function encodeURIComponent (built-in since ES-5)
   * @returns {Promise<ServerResponse<{}>>}
   */
  supplyAsync: (maybePayload: {
    locatorKey: string;
  }) => Promise<ServerResponse>;

  constructor(sdk: XQSDK) {
    super(sdk);

    this.serviceName = "key";
    this.requiredFields = [RevokeKeyAccess.LOCATOR_KEY];

    this.supplyAsync = (maybePayLoad) => {
      try {
        this.sdk.validateInput(maybePayLoad, this.requiredFields);
        const accessToken = this.sdk.validateAccessToken();
        const locatorKey = maybePayLoad[RevokeKeyAccess.LOCATOR_KEY];

        const additionalHeaderProperties = {
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
