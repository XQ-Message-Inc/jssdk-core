import CallMethod from "../../CallMethod";
import Destination from "../../Destination";
import ServerResponse from "../../ServerResponse";
import XQModule from "../XQModule";
import XQSDK from "../../XQSDK";

/**
 * A service which is utilized to find a grouping of dashboard users.
 * Can be optionally filtered by regex on ID
 *
 * @class [FindUserGroups]
 */
export default class FindUserGroups extends XQModule {
  /** The required fields of the payload needed to utilize the service */
  requiredFields: string[];

  /** Specified name of the service */
  serviceName: string;

  /** The field name representing the dashboard user groups */
  static GROUPS: "groups";

  /** The field name representing the id of a user group */
  static ID: "id";

  /**
   * @param {Map} maybePayLoad - Container for the request parameters supplied to this method.
   * @returns {Promise<ServerResponse<{payload:{groups:[{id:int, name:string, bid:int}]}}>>}
   */
  supplyAsync: (maybePayload: null) => Promise<ServerResponse>;

  constructor(sdk: XQSDK) {
    super(sdk);
    this.serviceName = "usergroup";
    this.requiredFields = [];

    this.supplyAsync = (maybePayLoad) => {
      try {
        const dashboardAccessToken = this.sdk.validateAccessToken(
          Destination.DASHBOARD
        );

        const additionalHeaderProperties = {
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
        return new Promise((resolve) => {
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
