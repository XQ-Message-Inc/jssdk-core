import CallMethod from "../../CallMethod";
import Destination from "../../Destination";
import ServerResponse from "../../ServerResponse";
import XQModule from "../XQModule";
import XQSDK from "../../XQSDK";

/**
 * A service which is utilized to update a grouping of dashboard users
 *
 * @class [UpdateUserGroup]
 */
export default class UpdateUserGroup extends XQModule {
  /** The required fields of the payload needed to utilize the service */
  requiredFields: string[];

  /** Specified name of the service */
  serviceName: string;

  /** The field name representing the id of the user group */
  static ID: "id" = "id";

  /** The field name representing the members of the user group */
  static MEMBERS: "members" = "members";

  /** The field name representing the name of the user group */
  static NAME: "name" = "name";

  /**
   * @param {Map} maybePayLoad - Container for the request parameters supplied to this method.
   * @param {String} id - the id of the user group to be updated
   * @param {String} name - the updated name of the user group
   * @param {String} members - the updated members of the user group
   * @returns {Promise<ServerResponse<{payload:{}}>>}
   */
  supplyAsync: (maybePayload: {
    id: string;
    name: string;
    members: string[];
  }) => Promise<ServerResponse>;

  constructor(sdk: XQSDK) {
    super(sdk);
    this.serviceName = "usergroup";
    this.requiredFields = [UpdateUserGroup.ID];

    this.supplyAsync = (maybePayLoad) => {
      try {
        this.sdk.validateInput(maybePayLoad, this.requiredFields);

        const dashboardAccessToken = this.sdk.validateAccessToken(
          Destination.DASHBOARD
        );

        const additionalHeaderProperties = {
          Authorization: "Bearer " + dashboardAccessToken,
        };

        const payload = {
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

UpdateUserGroup.ID = "id";
UpdateUserGroup.NAME = "name";
UpdateUserGroup.MEMBERS = "members";
