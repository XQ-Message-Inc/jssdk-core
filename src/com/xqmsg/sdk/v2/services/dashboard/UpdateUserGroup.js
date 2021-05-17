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
        this.requiredFields = [UpdateUserGroup.ID];
    }


    /**
     * @param {Map} maybePayLoad - Container for the request parameters supplied to this method.
     * @returns {Promise<ServerResponse<{payload:{}}>>}
     */
    supplyAsync = function (maybePayLoad) {

        try {

            let self = this;

            self.sdk.validateInput(maybePayLoad, self.requiredFields);

            let dashboardAccessToken = self.sdk.validateAccessToken(Destination.DASHBOARD);

            let additionalHeaderProperties = {"Authorization": "Bearer " + dashboardAccessToken};

            let payload = {
                [UpdateUserGroup.NAME]: maybePayLoad[UpdateUserGroup.NAME],
                [UpdateUserGroup.MEMBERS]: maybePayLoad[UpdateUserGroup.MEMBERS],
            };

            return self.sdk.call(self.sdk.DASHBOARD_SERVER_URL,
                self.serviceName + '/' + maybePayLoad[UpdateUserGroup.ID],
                CallMethod.PATCH,
                additionalHeaderProperties,
                payload,
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

UpdateUserGroup.ID = "id";
UpdateUserGroup.NAME = "name";
UpdateUserGroup.MEMBERS = "members";
