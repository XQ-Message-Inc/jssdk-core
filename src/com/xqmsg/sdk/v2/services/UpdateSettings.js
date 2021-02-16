import XQModule from "./XQModule.js";
import CallMethod from "./../CallMethod.js";
import NotificationEnum from "./../NotificationEnum.js";
import ServerResponse from "../ServerResponse.js";

export default class UpdateSettings extends XQModule {

    constructor(sdk) {
        super(sdk);

        this.serviceName = "settings";
        this.requiredFields=[];

    }

    /**
     *
     * @param {Map} maybePayLoad - Container for the request parameters supplied to this method.
     * @param {boolean} maybePayLoad.newsLetter - Should this user receive newsletters or not? <br>This is only valid for new users, and is ignored if the user already exists.
     * @param {NotificationEnum.options} maybePayLoad.notifications - Specifies the notifications that the user should receive  <br>.

     * @returns {Promise<ServerResponse<{}>>}
     */
    supplyAsync = function (maybePayLoad) {

        try {

            let self = this;
            let accessToken = self.sdk.validateAccessToken();

            let additionalHeaderProperties = {"Authorization": "Bearer " + accessToken};

            return self.sdk.call(self.sdk.SUBSCRIPTION_SERVER_URL,
                self.serviceName,
                CallMethod.prototype.OPTIONS,
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


UpdateSettings.prototype.NOTIFICATIONS = "notifications";
UpdateSettings.prototype.NEWSLETTER = "newsletter";
