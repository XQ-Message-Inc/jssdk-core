import XQModule from "./XQModule.js";
import CallMethod from "./../CallMethod.js";
import ServerResponse from "../ServerResponse.js";


/**
 * @Class
 * Get ser information.
 */
export default class GetUserInfo extends XQModule {

    constructor(sdk) {
        super(sdk);

        this.serviceName = "subscriber";
        this.requiredFields = [];
    }


    /**
     * @param {Map} [maybePayLoad=null]
     * @returns {Promise<ServerResponse<{payload:{id:long, usr:string, firstName:string, sub:string, starts:long, ends:Long}}>>}
     */
    supplyAsync = function (maybePayLoad) {

        try {

            let self = this;
            let accessToken = self.sdk.validateAccessToken();

            let additionalHeaderProperties = {"Authorization": "Bearer " + accessToken};

            return self.sdk.call(self.sdk.SUBSCRIPTION_SERVER_URL,
                self.serviceName,
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


GetUserInfo.prototype.ID = "id";
GetUserInfo.prototype.FIRST_NAME = "firstName";
GetUserInfo.prototype.LAST_NAME = "lastName";
/** The user's email asddress.*/
GetUserInfo.prototype.USER = "user";
GetUserInfo.prototype.SUBSCRIPTION_STATUS = "sub";
/**The datetime (in milliseconds) when the subscription was activated.*/
GetUserInfo.prototype.STARTS = "starts";
/**The datetime (in milliseconds) when the subscription will end*/
GetUserInfo.prototype.ENDS = "ends";