import XQModule from "../XQModule.js";
import CallMethod from "../../CallMethod.js";
import Destination from "../../Destination.js";
import ServerResponse from "../../ServerResponse.js";

/**
 *
 *  Remove a grouping of dashboard users
 *
 * @class [RemoveUserGroup]
 */
export default class RemoveUserGroup extends XQModule {
    
    constructor(sdk) {
        super(sdk);
        this.serviceName = "usergroup";
        this.requiredFields = [RemoveUserGroup.ID];
    }


    /**
     * @param {Map} maybePayLoad - Container for the request parameters supplied to this method.
     * @returns {Promise<ServerResponse<{payload:{}>>}
     */
    supplyAsync = function (maybePayLoad) {

        try {
            
            this.sdk.validateInput(maybePayLoad, this.requiredFields);

            let dashboardAccessToken = this.sdk.validateAccessToken(Destination.DASHBOARD);

            let additionalHeaderProperties = {"Authorization": "Bearer " + dashboardAccessToken};

            return this.sdk
                       .call(this.sdk.DASHBOARD_SERVER_URL,
                             this.serviceName + '/' + maybePayLoad[RemoveUserGroup.ID],
                             CallMethod.DELETE,
                             additionalHeaderProperties,
                             null,
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

RemoveUserGroup.ID = "id";
