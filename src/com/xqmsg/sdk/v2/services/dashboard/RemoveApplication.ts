import CallMethod from "../../CallMethod";
import Destination from "../../Destination";
import ServerResponse from "../../ServerResponse";
import XQModule from "../XQModule";
import XQSDK from "../../XQSDK";

/**
 * A service which is utilized to remove an existing developer application.
 *
 * @class [RemoveApplication]
 */
export default class RemoveApplication extends XQModule {
  /** The required fields of the payload needed to utilize the service */
  requiredFields: string[];

  /** Specified name of the service */
  serviceName: string;

  /** The field name representing the ID of the application */
  static ID: "id" = "id";

  /**
   * @param {Map} maybePayLoad - Container for the request parameters supplied to this method.
   * @param {Number} id - the id of the application
   * @returns {Promise<ServerResponse<{payload:{}}>>}
   */
  supplyAsync: (maybePayload: {
    [RemoveApplication.ID]: number;
  }) => Promise<ServerResponse>;

  constructor(sdk: XQSDK) {
    super(sdk);
    this.serviceName = "devapp";
    this.requiredFields = [RemoveApplication.ID];

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
          this.serviceName + "/" + maybePayLoad[RemoveApplication.ID],
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
