import CallMethod from "../../CallMethod";
import Destination from "../../Destination";
import ServerResponse from "../../ServerResponse";
import XQModule, { SupplyAsync } from "../XQModule";
import XQSDK from "../../XQSDK";

/**
 *
 *  Update a grouping of dashboard users
 *
 * @class [UpdateUserGroup]
 */
export default class UpdateUserGroup extends XQModule {
  requiredFields: string[];
  serviceName: string;
  static ID: string;
  static MEMBERS: string;
  static NAME: string;
  supplyAsync: SupplyAsync;

  constructor(sdk: XQSDK) {
    super(sdk);
    this.serviceName = "usergroup";
    this.requiredFields = [UpdateUserGroup.ID];

    /**
     * @param {Map} maybePayLoad - Container for the request parameters supplied to this method.
     * @returns {Promise<ServerResponse<{payload:{}}>>}
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

        let payload = {
          [UpdateUserGroup.NAME]: maybePayLoad[UpdateUserGroup.NAME],
          [UpdateUserGroup.MEMBERS]: maybePayLoad[UpdateUserGroup.MEMBERS],
        };

        return this.sdk.call(
          this.sdk.DASHBOARD_SERVER_URL,
          this.serviceName + "/" + maybePayLoad[UpdateUserGroup.ID],
          CallMethod.PATCH,
          additionalHeaderProperties,
          payload,
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

UpdateUserGroup.ID = "id";
UpdateUserGroup.NAME = "name";
UpdateUserGroup.MEMBERS = "members";
