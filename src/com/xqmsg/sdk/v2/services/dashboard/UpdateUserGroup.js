import XQModule from "../XQModule.js";
import CallMethod from "../../CallMethod.js";
import Destination from "../../Destination.js";
import ServerResponse from "../../ServerResponse.js";

/**
 *
 *  Update a grouping of dashboard users
 *
 * @class [UpdateUserGroup]
 */
export default class UpdateUserGroup extends XQModule {


    constructor(sdk) {
        super(sdk);
        this.serviceName = "usergroup";
        this.requiredFields = [this.ID];
    }


    /**
     * @param {Map} maybePayLoad - Container for the request parameters supplied to this method.
     * @returns {Promise<ServerResponse<{payload:{}}>>}
     */
    supplyAsync = function (maybePayLoad) {

        try {

            let self = this;

            self.sdk.validateInput(maybePayLoad, self.requiredFields);

            let dashboardAccessToken = self.sdk.validateAccessToken(Destination.prototype.DASHBOARD);

            let additionalHeaderProperties = {"Authorization": "Bearer " + dashboardAccessToken};

            let payload = {
                [UpdateUserGroup.prototype.NAME]: maybePayLoad[this.NAME],
                [UpdateUserGroup.prototype.MEMBERS]: maybePayLoad[this.MEMBERS],
            };

            return self.sdk.call(self.sdk.DASHBOARD_SERVER_URL,
                self.serviceName + '/' + maybePayLoad[this.ID],
                CallMethod.prototype.PATCH,
                additionalHeaderProperties,
                payload,
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

UpdateUserGroup.prototype.ID = "id";
UpdateUserGroup.prototype.NAME = "name";
UpdateUserGroup.prototype.MEMBERS = "members";
