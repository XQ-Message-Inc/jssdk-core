import XQModule from "../XQModule.js";
import CallMethod from "../../CallMethod.js";
import Destination from "../../Destination.js";
import ServerResponse from "../../ServerResponse.js";

/**
 *
 *  Find a dashboard Contacts
 *
 * @class [FindContacts]
 */
export default class FindContacts extends XQModule {


    constructor(sdk) {
        super(sdk);
        this.serviceName = "contact";
        this.requiredFields = [];
    }


    /**
     * @param {Map} maybePayLoad - Container for the request parameters supplied to this method.
     * @returns {Promise<ServerResponse<{payload:{groups:[{id:int, name:string, bid:int}]}}>>}
     */
    supplyAsync = function (maybePayLoad) {

        try {

            let self = this;

            let dashboardAccessToken = self.sdk.validateAccessToken(Destination.prototype.DASHBOARD);

            let additionalHeaderProperties = {"Authorization": "Bearer " + dashboardAccessToken};

            return self.sdk.call(self.sdk.DASHBOARD_SERVER_URL,
                self.serviceName,
                CallMethod.prototype.GET,
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

FindContacts.prototype.ID = "id";
FindContacts.prototype.CONTACTS = "contacts";
FindContacts.prototype.FILTER = "filter";
FindContacts.prototype.ROLE = "role";
FindContacts.prototype.LIMIT = "limit";
FindContacts.prototype.PAGE = "page";
