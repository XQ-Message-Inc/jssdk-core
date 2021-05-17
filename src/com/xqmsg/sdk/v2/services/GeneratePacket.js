import XQModule from "./XQModule.js";
import CallMethod from "./../CallMethod.js";
import ServerResponse from "../ServerResponse.js";

/**
 * @class [GeneratePacket]
 */

export default class GeneratePacket extends XQModule{

    constructor(sdk) {
        super(sdk);

        this.serviceName="packet";
        this.requiredFields=[this.KEY, this.RECIPIENTS, this.EXPIRES_HOURS];
    }

    /**
     * @param {Map} maybePayLoad - Container for the request parameters supplied to this method.
     * @param {String} maybePayLoad.key - The secret key that the user wants to protect.
     * @param {Long} maybePayLoad.expires - The number of hours that this key will remain valid for. After this time, it will no longer be accessible.
     * @param {[String]} maybePayLoad.recipients  -  list of emails of those recipients who are allowed to access the key.
     * @param {Boolean} [maybePayLoad.dor=false] - Should the content be deleted after opening.
     *
     * @returns {Promise<ServerResponse<{payload:string}>>}
     */
    supplyAsync = function (maybePayLoad) {
        try {
            let self = this;
            self.sdk.validateInput(maybePayLoad, self.requiredFields);
            let accessToken = self.sdk.validateAccessToken();

            let additionalHeaderProperties = {"Authorization": "Bearer " + accessToken};

            maybePayLoad[self.RECIPIENTS]= maybePayLoad[self.RECIPIENTS].join(",");

            return self.sdk.call(self.sdk.SUBSCRIPTION_SERVER_URL,
                                 self.serviceName,
                                 CallMethod.prototype.POST,
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

GeneratePacket.prototype.KEY = "key";
GeneratePacket.prototype.RECIPIENTS = "recipients";
GeneratePacket.prototype.EXPIRES_HOURS = "expires";
GeneratePacket.prototype.DELETE_ON_RECEIPT = "dor";
GeneratePacket.prototype.TYPE = "type";
