import XQModule from "./XQModule.js";
import CallMethod from "./../CallMethod.js";
import ServerResponse from "../ServerResponse.js";

/**
 * Deletes the user specified by the access token.
 * After an account is deleted, the subscriber will be sent an email notifying them of its deletion.
 *
 * @class [DeleteSubscriber]
 */
export default class DeleteSubscriber extends XQModule{

    constructor(sdk) {
        super(sdk);

        this.serviceName = "subscriber";
    }


    /**
     *
     * @param {{}} [maybePayLoad=null]
     * @returns {Promise<ServerResponse<{}>>}
     */
    supplyAsync = function (maybePayLoad) {

        try {

            const self = this;
            let accessToken = self.sdk.validateAccessToken();

            let additionalHeaderProperties = {"Authorization": "Bearer " + accessToken};
            return self.sdk.call(self.sdk.SUBSCRIPTION_SERVER_URL,
                                 self.serviceName,
                                 CallMethod.prototype.DELETE,
                                 additionalHeaderProperties,
                                 maybePayLoad,
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
