import XQModule from "./XQModule.js";
import CallMethod from "./../CallMethod.js";
import ServerResponse from "../ServerResponse.js";

/**
 * This service allows a user to create a very short-lived version of their access token in order to access certain <br>
 * services such as file encryption/decryption on the XQ websie without having to transmit their main access token.
 */
export default class AuthorizeDelegate extends XQModule{

    constructor(sdk) {
        super(sdk);

        this.serviceName =  "delegate";
        this.requiredFields=[];

    }

    /**
     *
     * @param {{}} [maybePayLoad=null]
     * @returns {Promise<ServerResponse<{payload:string}>>}
     */
    supplyAsync = function (maybePayLoad) {

        try{
            let self = this;
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