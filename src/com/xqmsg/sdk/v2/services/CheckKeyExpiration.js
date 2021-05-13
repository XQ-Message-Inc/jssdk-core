import XQModule from "./XQModule.js";
import CallMethod from "./../CallMethod.js";
import ServerResponse from "../ServerResponse.js";

/**
 *
 * Check whether a particular key is expired or not without actually fetching it.
 *
 * @class [CheckKeyExpiration]
 */
export default class CheckKeyExpiration extends XQModule{

    constructor(sdk) {
        super(sdk);

        this.serviceName =  "expiration";
        this.requiredFields = [this.LOCATOR_KEY];
    }


    /**
     * @param {Map} maybePayLoad - Container for the request parameters supplied to this method.
     * @param {String} maybePayLoad.locatorToken - A URL encoded version of the key locator token to fetch the key from the server.
     * @see #encodeURIComponent function encodeURIComponent (built-in since ES-5)
     * @returns {Promise<ServerResponse<{payload:{expiresOn:long}}>>}
     **/
       supplyAsync = function (maybePayLoad) {

        try {

            const self = this;
            self.sdk.validateInput(maybePayLoad, self.requiredFields);
            let accessToken = self.sdk.validateAccessToken();

            let locatorKey = maybePayLoad[this.LOCATOR_KEY];
            let additionalHeaderProperties = {"Authorization": "Bearer " + accessToken};

            return self.sdk.call(self.sdk.VALIDATION_SERVER_URL,
                                 self.serviceName + '/' + encodeURIComponent(locatorKey),
                                 CallMethod.prototype.GET,
                                 additionalHeaderProperties,
                                 null,
                                 true);

        }
        catch (exception){
            return new Promise(function (resolve, reject) {
                resolve(
                    new ServerResponse(
                        ServerResponse.prototype.ERROR,
                        exception.code,
                        exception.reason
                    ));
            });
        }

    }

}

/**key to fetch the encryption key from the server*/
CheckKeyExpiration.prototype.LOCATOR_KEY = "locatorKey";
/**The number of seconds before this token expires.<br>If the token is already expired, this will be 0*/
CheckKeyExpiration.prototype.EXPIRES_IN = "expiresOn";

