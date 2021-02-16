import XQModule from "./XQModule.js";
import CallMethod from "./../CallMethod.js";
import ServerResponse from "../ServerResponse.js";

/**
 * Revokes a key using its token. <br>
 * Only the user who sent the message will be able to revoke it.
 * @class
 */
export default class DeleteAuthorization extends XQModule {

    constructor(sdk) {
        super(sdk);
        this.serviceName = "authorization";
    }

    /**
     *
     * @method supplyAsync
     * @param {{}} [maybePayLoad=null]
     * @returns {Promise<ServerResponse<{}>>}
     */
    supplyAsync = function (maybePayLoad) {

        try {

            const self = this;
            let accessToken = self.sdk.validateAccessToken();

            let additionalHeaderProperties = {"Authorization": "Bearer " + accessToken};

            return this.sdk.call(this.sdk.SUBSCRIPTION_SERVER_URL,
                                 this.serviceName,
                                 CallMethod.prototype.DELETE,
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
