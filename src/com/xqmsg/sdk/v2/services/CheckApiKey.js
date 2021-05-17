import XQModule from "./XQModule.js";
import CallMethod from "./../CallMethod.js";
import ServerResponse from "../ServerResponse.js";

/**
 * This service validates an API key and returns the scopes associated with it.
 *
 * @class [CheckApiKey]
 */
export default class CheckApiKey extends XQModule {


    constructor(sdk) {
        super(sdk);

        this.serviceName = "apikey";
        this.requiredFields = [this.API_KEY];
    }


  /**
   * @param {Map} maybePayLoad - Container for the request parameters supplied to this method.
   * @param {String} maybePayLoad.api-key - The API key whose scopes are to be checked
   *
   * @returns {Promise<ServerResponse<{payload:{scopes:[string]}}>>}
   */
    supplyAsync = function (maybePayLoad) {

        try {

            let self = this;
            self.sdk.validateInput(maybePayLoad, self.requiredFields);
            let accessToken = self.sdk.validateAccessToken();

            let additionalHeaderProperties = {"Authorization": "Bearer " + accessToken};

            return self.sdk.call(self.sdk.SUBSCRIPTION_SERVER_URL,
                this.serviceName,
                CallMethod.prototype.GET,
                additionalHeaderProperties,
                maybePayLoad,
                true);

        } catch (exception) {
            return new Promise(function (resolve, reject) {
                resolve(new ServerResponse(
                    ServerResponse.prototype.ERROR,
                    exception.code,
                    exception.reason
                ));
            });
        }


    }

}

CheckApiKey.prototype.API_KEY = "api-key";
CheckApiKey.prototype.SCOPES = "scopes";
