import XQModule from "./XQModule.js";
import CallMethod from "./../CallMethod.js";
import ServerResponse from "../ServerResponse.js";
import ExchangeForAccessToken from "./ExchangeForAccessToken.js";

/**
 * Authenticate the PIN which resulted from the preceding {@link RequestAccess} service call.<br>
 * If successful this service returns a  status of 204, No Content .
 *
 */
export default class CodeValidator extends XQModule {

    constructor(sdk) {
        super(sdk);

        this.serviceName = "codevalidation";
        this.requiredFields = [this.PIN];

    }

    /**
     * @param {Map} maybePayLoad - Container for the request parameters supplied to this method.
     * @param {String} maybePayLoad.pin - Pin to validate the access request
     *
     * @returns {Promise<ServerResponse<{payload:String}>>}
     */
    supplyAsync = function (maybePayLoad) {

        try {
            let self = this;
            self.sdk.validateInput(maybePayLoad, self.requiredFields);
            let preAuthToken = self.sdk.validatePreAuthToken();

            let additionalHeaderProperties = {"Authorization": "Bearer " + preAuthToken};

            return self.sdk
                .call(self.sdk.SUBSCRIPTION_SERVER_URL,
                    this.serviceName,
                    CallMethod.prototype.GET,
                    additionalHeaderProperties,
                    maybePayLoad,
                    true)
                .then(function (validationResponse) {
                    switch (validationResponse.status) {
                        case ServerResponse.prototype.OK: {
                            return new ExchangeForAccessToken(self.sdk).supplyAsync(null)
                        }
                        case ServerResponse.prototype.ERROR: {
                            console.info(validationResponse);
                            return ServerResponse.prototype.ERROR;
                        }
                    }
                });

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

/**Pin to validate the access request*/
CodeValidator.prototype.PIN = "pin";

