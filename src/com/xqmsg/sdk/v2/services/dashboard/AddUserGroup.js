import XQModule from "../XQModule.js";
import CallMethod from "../../CallMethod.js";
import Destination from "../../Destination.js";
import ServerResponse from "../../ServerResponse.js";

/**
 *
 *  Create a grouping of dashboard users
 *
 * @class [AddUserGroup]
 */
export default class AddUserGroup extends XQModule {

    constructor(sdk) {
        super(sdk);
        this.serviceName = "usergroup";
        this.requiredFields = [this.NAME];
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

AddUserGroup.prototype.ID = "id";
AddUserGroup.prototype.NAME = "name";
AddUserGroup.prototype.MEMBERS = "members";
