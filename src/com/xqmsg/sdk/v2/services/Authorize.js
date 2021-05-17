import XQModule from "./XQModule.js";
import CallMethod from "./../CallMethod.js";
import ServerResponse from "../ServerResponse.js";

/**
 *
 * Request an access token given an email address.<br>
 * If successful, the service itself will return a pre-authorization token that can be exchanged<br>
 * for a full access token after validation is complete.<br>
 * The user will also receive an email containing:<br>
 *    1. validation PIN<br>
 *    2. validation Link<br>
 * The user can then choose to either click the link to complete the process or use the PIN.<br>
 * The pin servers as the input parameter of {@link ValidateAccessRequest}.<br>
 *  @class [Authorize]
 */
export default class Authorize extends XQModule {

    constructor(sdk) {
        super(sdk);

        this.serviceName = "authorize";
        this.requiredFields = [this.USER];

    }

    /**
     * @param {Map} maybePayLoad - Container for the request parameters supplied to this method.
     * @param {String} maybePayLoad.user - Email of the user to be validated.
     * @param {String} [maybePayLoad.firstName]  - First name of the user.
     * @param {String} [maybePayLoad.lastName] - Last name of the user.
     * @param {Boolean} [maybePayLoad.newsLetter=false] - Should the user receive a newsletter.
     * @param {NotificationEnum} [maybePayLoad.notifications=0] Enum Value to specify Notification Settings
     *
     * @returns {Promise<ServerResponse<{payload:string}>>}
     */
    supplyAsync = function (maybePayLoad) {

        try {
            let self = this;
            self.sdk.validateInput(maybePayLoad, self.requiredFields);
            let user = maybePayLoad[self.USER];

            return self.sdk.call(self.sdk.SUBSCRIPTION_SERVER_URL,
                                self.serviceName,
                                CallMethod.prototype.POST,
                                null,
                                maybePayLoad,
                                true)
                            .then(function (response) {
                                switch (response.status) {
                                    case ServerResponse.prototype.OK: {
                                        const temporaryAccessToken = response.payload;
                                        self.cache.putXQPreAuthToken(user, temporaryAccessToken);
                                        self.cache.putActiveProfile(user);
                                    }
                                    default: {
                                        return response;
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

/** The email of the user*/
Authorize.prototype.USER = "user";
/** if 'pin' is sent the validation email will only have the code and no confirmation button */
Authorize.prototype.CODE_TYPE = "codetype";
/** The first name of the user */
Authorize.prototype.FIRST_NAME = "firstName";
/** The last name of the user*/
Authorize.prototype.LAST_NAME = "lastName";
/** The name of this service */
Authorize.prototype.NEWS_LETTER = "newsLetter";
/** The name of this service*/
Authorize.prototype.NOTIFICATIONS = "notifications";
