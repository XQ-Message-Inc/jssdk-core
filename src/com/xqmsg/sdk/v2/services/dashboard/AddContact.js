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
        this.requiredFields = [AddContact.EMAIL, AddContact.ROLE, AddContact.NOTIFICATIONS];
    }

    /**
     * @param {Map} maybePayLoad - Container for the request parameters supplied to this method.
     * @returns {Promise<ServerResponse<{payload:{id:int, status:string}}>>}
     */
    supplyAsync = function (maybePayLoad) {

        try {

            let self = this;

            self.sdk.validateInput(maybePayLoad, self.requiredFields);

            let dashboardAccessToken = self.sdk.validateAccessToken(Destination.DASHBOARD);

            let additionalHeaderProperties = {"Authorization": "Bearer " + dashboardAccessToken};

            return self.sdk.call(self.sdk.DASHBOARD_SERVER_URL,
                self.serviceName,
                CallMethod.POST,
                additionalHeaderProperties,
                maybePayLoad,
                true,
                Destination.DASHBOARD);

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

AddContact.ID = "id";
AddContact.EMAIL = "email";
AddContact.ROLE = "role";
AddContact.NOTIFICATIONS = "notifications";
AddContact.LAST_NAME = "lastName";
AddContact.FIRST_NAME = "firstName";
AddContact.TITLE = "title";
