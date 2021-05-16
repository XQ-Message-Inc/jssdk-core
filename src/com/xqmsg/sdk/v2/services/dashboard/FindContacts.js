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
            
            let dashboardAccessToken = this.sdk.validateAccessToken(Destination.DASHBOARD);

            let additionalHeaderProperties = {"Authorization": "Bearer " + dashboardAccessToken};

            return this.sdk
                       .call(this.sdk.DASHBOARD_SERVER_URL,
                             this.serviceName,
                             CallMethod.GET,
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

FindContacts.ID = "id";
FindContacts.CONTACTS = "contacts";
FindContacts.FILTER = "filter";
FindContacts.ROLE = "role";
FindContacts.LIMIT = "limit";
FindContacts.PAGE = "page";
