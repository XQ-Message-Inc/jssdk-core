import CallMethod from "../CallMethod";
import ServerResponse from "../ServerResponse";
import XQModule from "./XQModule";
import XQSDK from "../XQSDK";

/**
 * A service which is used to fetch an encryption key using a valid locator key.
 *
 * The key will only be returned if the following hold true:
 * * The access token of the requesting user is valid and unexpired.
 * * The expiration time specified for the key has not elapsed.
 * * The user requesting the key was listed as a valid recipient by the sender.
 * * The key is either not geofenced, or is being accessed from an authorized location.
 * If any of these is not true, an error will be returned instead.
 *
 * @class [FetchKey]
 */
export default class FetchKey extends XQModule {
  /** The required fields of the payload needed to utilize the service */
  requiredFields: string[];

  /** Specified name of the service */
  serviceName: string;

  /** The field name representing the key used to fetch the encryption key from the server */
  static LOCATOR_KEY: "locatorKey" = "locatorKey";

  /**
   * @param {Map} maybePayLoad - Container for the request parameters supplied to this method.
   * @param {String} maybePayLoad.locatorKey - the key used to fetch the encryption key from the server
   * @returns {Promise<ServerResponse<{payload:string}>>}
   */
  supplyAsync: (maybePayLoad: {
    locatorKey: string;
  }) => Promise<ServerResponse>;

  constructor(sdk: XQSDK) {
    super(sdk);

    this.sdk = sdk;
    this.serviceName = "key";
    this.requiredFields = [FetchKey.LOCATOR_KEY];

    this.supplyAsync = (maybePayLoad) => {
      try {
        this.sdk.validateInput(maybePayLoad, this.requiredFields);
        const accessToken = this.sdk.validateAccessToken();

        const locatorKey = maybePayLoad[FetchKey.LOCATOR_KEY];
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
          .then((serverResponse: ServerResponse) => {
            return new Promise((resolve) => {
              switch (serverResponse.status) {
                case ServerResponse.OK: {
                  let key = serverResponse.payload;
                  if (key.startsWith(".")) key = key.substr(2);
                  resolve(new ServerResponse(ServerResponse.OK, 200, key));
                  break;
                }
                case ServerResponse.ERROR: {
                  console.error(
                    `RetrieveKey failed, code: ${serverResponse.statusCode}, reason: ${serverResponse.payload}`
                  );
                  resolve(serverResponse);
                  break;
                }
              }
            });
          });
      } catch (validationException) {
        return new Promise((resolve) => {
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
