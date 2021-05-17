import XQModule from "../XQModule.js";
import CallMethod from "../../CallMethod.js";
import Destination from "../../Destination.js";
import ServerResponse from "../../ServerResponse.js";

/**
 *
 * Retrieves a listing of dashboard applications associated with the user
 *
 * @class [GetApplications]
 */
export default class GetApplications extends XQModule {

    constructor(sdk) {
        super(sdk);
        this.serviceName = "devapps";
        this.requiredFields = [];
    }


    /**
     * @param {{}} [maybePayLoad=null]
     * @returns {Promise<ServerResponse<{payload:{apps:[{id:int, name:string, description:string}]}}>>}

     */
    supplyAsync = function (maybePayLoad) {

        try {

            let self = this;
            let dashboardAccessToken = self.sdk.validateAccessToken(Destination.DASHBOARD);

            let additionalHeaderProperties = {"Authorization": "Bearer " + dashboardAccessToken};

            return self.sdk.call(self.sdk.DASHBOARD_SERVER_URL,
                self.serviceName,
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

GetApplications.APPS = "apps";
