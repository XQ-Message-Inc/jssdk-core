import XQModule from "../XQModule";
import CallMethod from "../../CallMethod";
import Destination from "../../Destination";
import ServerResponse from "../../ServerResponse";
import XQSDK from "../../XQSDK";

/**
 *
 *  Create a grouping of dashboard users
 *
 * @class [AddUserGroup]
 */
export default class AddUserGroup extends XQModule {
  requiredFields: string[];
  serviceName: string;
  static ID: string;
  static MEMBERS: string;
  static NAME: string;
  supplyAsync: (maybePayLoad: Record<string, any>) => ServerResponse;

  constructor(sdk: XQSDK) {
    super(sdk);
    this.serviceName = "usergroup";
    this.requiredFields = [AddUserGroup.NAME];

    /**
     * @param {Map} maybePayLoad - Container for the request parameters supplied to this method.
     * @returns {Promise<ServerResponse<{payload:{id:int, status:string}}>>}
     */
    this.supplyAsync = (maybePayLoad) => {
      try {
        this.sdk.validateInput(maybePayLoad, this.requiredFields);

        let dashboardAccessToken = this.sdk.validateAccessToken(
          Destination.DASHBOARD
        );

        let additionalHeaderProperties = {
          Authorization: "Bearer " + dashboardAccessToken,
        };

        return this.sdk.call(
          this.sdk.DASHBOARD_SERVER_URL,
          this.serviceName,
          CallMethod.POST,
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

AddUserGroup.ID = "id";
AddUserGroup.NAME = "name";
AddUserGroup.MEMBERS = "members";
