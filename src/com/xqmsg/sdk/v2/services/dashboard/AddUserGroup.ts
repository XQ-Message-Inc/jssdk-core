import CallMethod from "../../CallMethod";
import Destination from "../../Destination";
import ServerResponse from "../../ServerResponse";
import XQModule from "../XQModule";
import XQSDK from "../../XQSDK";

/**
 * A service which is utilized create a grouping of dashboard users
 *
 * @class [AddUserGroup]
 */
export default class AddUserGroup extends XQModule {
  /** The required fields of the payload needed to utilize the service */
  requiredFields: string[];

  /** Specified name of the service */
  serviceName: string;

  /** The field name representing the new group's ID */
  static ID: "id" = "id";

  /** The field name representing the new group's members */
  static MEMBERS: "members" = "members";

  /** The field name representing the new group's name */
  static NAME: "name" = "name";

  /**
   * @param {Map} maybePayLoad - Container for the request parameters supplied to this method.
   * @param {[String]} maybePayLoad.name - the name of the user group
   * @returns {Promise<ServerResponse<{}>>}
   */
  supplyAsync: (maybePayLoad: { name: string }) => Promise<ServerResponse>;

  constructor(sdk: XQSDK) {
    super(sdk);
    this.serviceName = "usergroup";
    this.requiredFields = [AddUserGroup.NAME];

    /**
     * @param {Map} maybePayLoad - Container for the request parameters supplied to this method.
     * @param {String} name - the name of the new group
     * @returns {Promise<ServerResponse<{payload:{id:int, status:string}}>>}
     */
    this.supplyAsync = (maybePayLoad) => {
      try {
        this.sdk.validateInput(maybePayLoad, this.requiredFields);

        const dashboardAccessToken = this.sdk.validateAccessToken(
          Destination.DASHBOARD
        );

        const additionalHeaderProperties = {
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
