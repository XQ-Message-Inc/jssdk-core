import XQModule from "./XQModule.js";
import CallMethod from "./../CallMethod.js";
import ServerResponse from "../ServerResponse.js";

/**
 * Revokes a key using its token.
 * Only the user who sent the message will be able to revoke it.
 *
 * @class [RevokeKeyAccess]
 */
export default class RevokeKeyAccess extends XQModule{

    constructor(sdk) {
        super(sdk);

        this.serviceName =  "key";
        this.requiredFields = [this.LOCATOR_KEY];
    }


    /**
     * @param {Map} maybePayLoad - Container for the request parameters supplied to this method.
     * @param {[String]} maybePayLoad.locatorToken - The  locator token,  used as a URL to discover the key on  the server.]
     *                 The URL encoding part is handled internally in the service itself
     * @see #encodeURIComponent function encodeURIComponent (built-in since ES-5)
     * @returns {Promise<ServerResponse<{}>>}
     */
    supplyAsync = function (maybePayLoad) {

        try {
            const self = this;
            self.sdk.validateInput(maybePayLoad, self.requiredFields);
            let accessToken = self.sdk.validateAccessToken();
            let locatorKey = maybePayLoad[self.LOCATOR_KEY];

            let additionalHeaderProperties = {"Authorization": "Bearer " + accessToken};

            return self.sdk.call(self.sdk.VALIDATION_SERVER_URL,
                                 self.serviceName + '/' + encodeURIComponent(locatorKey),
                                 CallMethod.prototype.OPTIONS,
                                 additionalHeaderProperties,
                                 null,
                                 true);

        }
        catch (exception){
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

RevokeKeyAccess.prototype.LOCATOR_KEY = "locatorKey";
