import XQModule from "./XQModule.js";
import CallMethod from "./../CallMethod.js";
import ServerResponse from "./../ServerResponse.js";

/**
 * The key will only be returned if the following hold true:
 * The access token of the requesting user is valid and unexpired.
 * The expiration time specified for the key has not elapsed.
 * The person requesting the key was listed as a valid recipient by the sender.
 * The key is either not geofenced, or is being accessed from an authorized location.
 * If any of these is not true, an error will be returned instead.
 *
 * @class [FetchKey]
 */
export default class FetchKey extends XQModule {
  constructor(sdk) {
    super(sdk);

    this.sdk = sdk;
    this.serviceName = "key";
    this.requiredFields = [FetchKey.LOCATOR_KEY];

    /**
     * @param {Map} maybePayLoad - Container for the request parameters supplied to this method.
     * @param {String} maybePayLoad.locatorToken - The  locator token,  used as a URL to discover the key on  the server
     *                The URL encoding part is handled internally in the service itself
     * @returns {Promise<ServerResponse<{payload:string}>>}
     */
    this.supplyAsync = (maybePayLoad) => {
      try {
        this.sdk.validateInput(maybePayLoad, this.requiredFields);
        let accessToken = this.sdk.validateAccessToken();

        let locatorKey = maybePayLoad[FetchKey.LOCATOR_KEY];
        let additionalHeaderProperties = {
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
          .then((serverResponse) => {
            return new Promise((resolve, reject) => {
              switch (serverResponse.status) {
                case ServerResponse.OK: {
                  let key = serverResponse.payload;
                  key = key.substr(2);

                  resolve(
                    new ServerResponse(
                      ServerResponse.OK,
                      ServerResponse.OK,
                      key
                    )
                  );
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

FetchKey.LOCATOR_KEY = "locatorKey";
