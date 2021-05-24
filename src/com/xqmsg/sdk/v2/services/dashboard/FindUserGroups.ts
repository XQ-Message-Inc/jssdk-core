import CallMethod from "../../CallMethod";
import Destination from "../../Destination";
import ServerResponse from "../../ServerResponse";
import XQModule, { SupplyAsync } from "../XQModule";
import XQSDK from "../../XQSDK";

/**
 *
 *  Find a grouping of dashboard users. Can be optionally filtered by regex on ID
 *
 * @class [FindUserGroups]
 */
export default class FindUserGroups extends XQModule {
  /** The required fields of the payload needed to utilize the service */
  requiredFields: string[];

  /** Specified name of the service */
  serviceName: string;
  static GROUPS: string;
  static ID: string;
  supplyAsync: SupplyAsync;

  constructor(sdk: XQSDK) {
    super(sdk);
    this.serviceName = "usergroup";
    this.requiredFields = [];

    /**
     * @param {Map} maybePayLoad - Container for the request parameters supplied to this method.
     * @returns {Promise<ServerResponse<{payload:{groups:[{id:int, name:string, bid:int}]}}>>}
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

FindUserGroups.ID = "id";
FindUserGroups.GROUPS = "groups";
