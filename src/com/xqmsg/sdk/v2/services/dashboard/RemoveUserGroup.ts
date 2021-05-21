import CallMethod from "../../CallMethod";
import Destination from "../../Destination";
import ServerResponse from "../../ServerResponse";
import XQModule, { SupplyAsync } from "../XQModule";
import XQSDK from "../../XQSDK";

/**
 *
 *  Remove a grouping of dashboard users
 *
 * @class [RemoveUserGroup]
 */
export default class RemoveUserGroup extends XQModule {
  serviceName: string;
  requiredFields: string[];
  static ID: string;
  supplyAsync: SupplyAsync;

  constructor(sdk: XQSDK) {
    super(sdk);
    this.serviceName = "usergroup";
    this.requiredFields = [RemoveUserGroup.ID];

    /**
     * @param {Map} maybePayLoad - Container for the request parameters supplied to this method.
     * @returns {Promise<ServerResponse<{payload:{}>>}
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
          this.serviceName + "/" + maybePayLoad[RemoveUserGroup.ID],
          CallMethod.DELETE,
          additionalHeaderProperties,
          null,
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

RemoveUserGroup.ID = "id";
