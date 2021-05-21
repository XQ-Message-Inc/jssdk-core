import CallMethod from "../../CallMethod";
import Destination from "../../Destination";
import ServerResponse from "../../ServerResponse";
import XQSDK from "../../XQSDK";
import XQModule, { SupplyAsync } from "../XQModule";

/**
 *
 * Retrieves a listing of dashboard applications associated with the user
 *
 * @class [GetApplications]
 */
export default class GetApplications extends XQModule {
  serviceName: string;
  requiredFields: string[];
  supplyAsync: SupplyAsync;
  static APPS: string;

  constructor(sdk: XQSDK) {
    super(sdk);
    this.serviceName = "devapps";
    this.requiredFields = [];

    /**
     * @param {{}} [maybePayLoad=null]
     * @returns {Promise<ServerResponse<{payload:{apps:[{id:int, name:string, description:string}]}}>>}

     */
    this.supplyAsync = (maybePayLoad) => {
      try {
        let dashboardAccessToken = this.sdk.validateAccessToken(
          Destination.DASHBOARD
        );

        let additionalHeaderProperties = {
          Authorization: "Bearer " + dashboardAccessToken,
        };

        return this.sdk.call(
          this.sdk.DASHBOARD_SERVER_URL,
          this.serviceName,
          CallMethod.GET,
          additionalHeaderProperties,
          maybePayLoad,
          true,
          Destination.DASHBOARD
        );
      } catch (exception) {
        return new Promise((resolve, reject) => {
          resolve(
            new ServerResponse(
              ServerResponse.ERROR,
              exception.code,
              exception.reason
            )
          );
        });
      }
    };
  }
}

GetApplications.APPS = "apps";
