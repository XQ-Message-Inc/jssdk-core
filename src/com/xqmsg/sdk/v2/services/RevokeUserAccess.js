import XQModule from "./XQModule.js";
import CallMethod from "./../CallMethod.js";
import ServerResponse from "../ServerResponse.js";

/**
 * This service will revoke access to keys for specific recipients without revoking the entire
 * token.
 */
export default class RevokeUserAccess extends XQModule{

    constructor(sdk) {
        super(sdk);

        this.serviceName =  "revoke";
        this.requiredFields = [this.RECIPIENTS, this.LOCATOR_KEY];
    }

    /**
     * @param {Map} maybePayLoad - Container for the request parameters supplied to this method.
     * @param {[String]} maybePayLoad.recipients! - List of emails of users intended to have read access to the encrypted content removed.<br>
     * @param {String} maybePayLoad.locatorToken! - The  locator token,  used as a URL to discover the key on  the server.
     *                                               The URL encoding part is handled internally in the service itself
     * @see #encodeURIComponent function encodeURIComponent (built-in since ES-5)
     * @returns {Promise<ServerResponse<{}>>}
     */
    supplyAsync = function (maybePayLoad) {

        try {
            const self = this;
            self.sdk.validateInput(maybePayLoad, self.requiredFields);
            let accessToken = self.sdk.validateAccessToken();

            let locatorKey = maybePayLoad[self.LOCATOR_KEY];
            maybePayLoad[self.RECIPIENTS]= maybePayLoad[self.RECIPIENTS].join(",");

            let additionalHeaderProperties = {"Authorization": "Bearer " + accessToken};

            return self.sdk.call(self.sdk.VALIDATION_SERVER_URL,
                self.serviceName + '/' + encodeURIComponent(locatorKey),
                CallMethod.prototype.OPTIONS,
                additionalHeaderProperties,
                maybePayLoad,
                true);

        }
        catch (validationException){
            return new Promise(function (resolve, reject) {
                resolve(new ServerResponse(
                    ServerResponse.prototype.ERROR,
                    validationException.code,
                    validationException.reason
                ));
            });
        }



    }


}

RevokeUserAccess.prototype.LOCATOR_KEY = "locatorKey";
RevokeUserAccess.prototype.RECIPIENTS = "recipients";

