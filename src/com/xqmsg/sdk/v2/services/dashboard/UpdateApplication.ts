import CallMethod from "../../CallMethod";
import Destination from "../../Destination";
import ServerResponse from "../../ServerResponse";
import XQModule from "../XQModule";
import XQSDK from "../../XQSDK";
import { XQServices } from "../../XQServicesEnum";

import handleException from "../../exceptions/handleException";

/**
 * A service which is utilized to update an existing developer application.
 *
 * @class [UpdateApplication]
 */
export default class UpdateApplication extends XQModule {
  /** The required fields of the payload needed to utilize the service */
  requiredFields: string[];

  /** Specified name of the service */
  serviceName: string;

  /** The field name representing the ID of the application */
  static ID: "id" = "id";

  /** The field name representing the name of the application to be updated */
  static NAME: "name" = "name";

  /** The field name representing the description of the application to be updated*/
  static DESC: "desc" = "desc";

  /**
   * @param {Map} maybePayLoad - Container for the request parameters supplied to this method.
   * @param {Number} id - the id of the application
   * @param {String} name - the name of the application
   * @param {String} desc - the description of the application
   * @returns {Promise<ServerResponse<{payload:{}}>>}
   */
  supplyAsync: (maybePayload: {
    [UpdateApplication.ID]: number;
    [UpdateApplication.NAME]?: string;
    [UpdateApplication.DESC]?: string;
  }) => Promise<ServerResponse>;

  constructor(sdk: XQSDK) {
    super(sdk);
    this.serviceName = "devapp";
    this.requiredFields = [UpdateApplication.ID];

    this.supplyAsync = (maybePayLoad) => {
      try {
        const dashboardAccessToken = this.sdk.validateAccessToken(
          Destination.DASHBOARD
        );

        const additionalHeaderProperties = {
          Authorization: "Bearer " + dashboardAccessToken,
        };

        return this.sdk
          .call(
            this.sdk.DASHBOARD_SERVER_URL,
            this.serviceName + "/" + maybePayLoad[UpdateApplication.ID],
            CallMethod.PATCH,
            additionalHeaderProperties,
            maybePayLoad,
            true,
            Destination.DASHBOARD
          )
          .then(async (response: ServerResponse) => {
            switch (response.status) {
              case ServerResponse.OK: {
                return response;
              }
              case ServerResponse.ERROR: {
                return handleException(response, XQServices.UpdateApplication);
              }
            }
          });
      } catch (exception) {
        return new Promise((resolve) =>
          resolve(handleException(exception, XQServices.UpdateApplication))
        );
      }
    };
  }
}
