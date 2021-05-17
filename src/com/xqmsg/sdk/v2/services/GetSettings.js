import XQModule from "./XQModule.js";
import CallMethod from "./../CallMethod.js";
import ServerResponse from "../ServerResponse.js";
import NotificationEnum from "../NotificationEnum.js";

/**
 *
 * Gets the notification and newsletter settings for the current user.
 *
 * @class [GetSettings]
 */
export default class GetSettings extends XQModule {


    constructor(sdk) {
        super(sdk);
        this.serviceName = "settings";
        this.requiredFields = [];
    }


    /**
     * @param {{}} [maybePayLoad=null]
     * @returns {Promise<ServerResponse<{payload:{notifications:NotificationEnum.options, newsLetter:boolean}}>>}
     */
    supplyAsync = function (maybePayLoad) {

        try {

            let self = this;
            let accessToken = self.sdk.validateAccessToken();

            let additionalHeaderProperties = {"Authorization": "Bearer " + accessToken};

            return self.sdk.call(self.sdk.SUBSCRIPTION_SERVER_URL,
                self.serviceName,
                CallMethod.GET,
                additionalHeaderProperties,
                maybePayLoad,
                true);

        } catch (exception) {
            return new Promise(function (resolve, reject) {
                resolve(new ServerResponse(
                    ServerResponse.ERROR,
                    exception.code,
                    exception.reason
                ));
            });
        }


    }

}

/**Specifies the  notifications that the user should receive  */
GetSettings.NOTIFICATIONS = "notifications";
/**Should this user receive newsletters or not? <br>This is only valid for new users, and is ignored if the user already exists.*/
GetSettings.NEWSLETTER = "newsletter"
