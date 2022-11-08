import CallMethod from "../../CallMethod";
import Destination from "../../Destination";
import ServerResponse from "../../ServerResponse";
import XQModule from "../XQModule";
import XQSDK from "../../XQSDK";

/**
 * A service which is utilized to disable a Contact
 *
 * @class [DisableContact]
 */
export default class DisableContact extends XQModule {
  /** The required fields of the payload needed to utilize the service */
  requiredFields: string[];

  /** Specified name of the service */
  serviceName: string;

  /** The field name representing the disabled Contact's ID */
  static ID: "id" = "id";

  /**
   * @param {Map} maybePayLoad - Container for the request parameters supplied to this method.
   * @param {String} id - the user id of the Contact that will be disabled
   * @returns {Promise<ServerResponse<{payload:{id:int, status:string}}>>}
   */
  supplyAsync: (maybePayLoad: { id: string }) => Promise<ServerResponse>;

  constructor(sdk: XQSDK) {
    super(sdk);
    this.serviceName = "contact";
    this.requiredFields = [DisableContact.ID];

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
          `${this.serviceName}/${maybePayLoad[DisableContact.ID]}`,
          CallMethod.DELETE,
          additionalHeaderProperties,
          null,
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

DisableContact.ID = "id";
