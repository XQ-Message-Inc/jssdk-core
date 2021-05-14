import XQModule from "../XQModule.js";
import CallMethod from "../../CallMethod.js";
import Destination from "../../Destination.js";
import ServerResponse from "../../ServerResponse.js";

/**
 *
 *  Create a new Contact
 *
 * @class [AddContact]
 */
export default class AddContact extends XQModule {

    constructor(sdk) {
        super(sdk);
        this.serviceName = "contact";
        this.requiredFields = [this.EMAIL, this.ROLE, this.NOTIFICATIONS];
    }

    /**
     * @param {Map} maybePayLoad - Container for the request parameters supplied to this method.
     * @returns {Promise<ServerResponse<{payload:{id:int, status:string}}>>}
     */
    supplyAsync = function (maybePayLoad) {

        try {

            let self = this;

            self.sdk.validateInput(maybePayLoad, self.requiredFields);

            let dashboardAccessToken = self.sdk.validateAccessToken(Destination.prototype.DASHBOARD);

            let additionalHeaderProperties = {"Authorization": "Bearer " + dashboardAccessToken};

            return self.sdk.call(self.sdk.DASHBOARD_SERVER_URL,
                self.serviceName,
                CallMethod.prototype.POST,
                additionalHeaderProperties,
                maybePayLoad,
                true,
                Destination.prototype.DASHBOARD);

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

AddContact.prototype.ID = "id";
AddContact.prototype.EMAIL = "email";
AddContact.prototype.ROLE = "role";
AddContact.prototype.NOTIFICATIONS = "notifications";
AddContact.prototype.LAST_NAME = "lastName";
AddContact.prototype.FIRST_NAME = "firstName";
AddContact.prototype.TITLE = "title";
