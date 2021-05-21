import CallMethod from "../CallMethod";
import ServerResponse from "../ServerResponse";
import XQModule, { SupplyAsync } from "./XQModule";
import XQSDK from "../XQSDK";

/**
 * This service validates an API key and returns the scopes associated with it.
 *
 * @class [CheckApiKey]
 */
export default class CheckApiKey extends XQModule {
  requiredFields: string[];
  serviceName: string;
  static API_KEY: string;
  static SCOPES: string;
  supplyAsync: SupplyAsync;

  constructor(sdk: XQSDK) {
    super(sdk);
    this.serviceName = "apikey";
    this.requiredFields = [CheckApiKey.API_KEY];

    /**
     * @param {Map} maybePayLoad - Container for the request parameters supplied to this method.
     * @param {String} maybePayLoad.api-key - The API key whose scopes are to be checked
     *
     * @returns {Promise<ServerResponse<{payload:{scopes:[string]}}>>}
     */
    this.supplyAsync = (maybePayLoad) => {
      try {
        this.sdk.validateInput(maybePayLoad, this.requiredFields);
        let accessToken = this.sdk.validateAccessToken();

        let additionalHeaderProperties = {
          Authorization: "Bearer " + accessToken,
        };

        return this.sdk.call(
          this.sdk.SUBSCRIPTION_SERVER_URL,
          this.serviceName,
          CallMethod.GET,
          additionalHeaderProperties,
          maybePayLoad,
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

CheckApiKey.API_KEY = "api-key";
CheckApiKey.SCOPES = "scopes";
