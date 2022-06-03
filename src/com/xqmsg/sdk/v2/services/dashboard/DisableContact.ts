import CallMethod from "../../CallMethod";
import Destination from "../../Destination";
import ServerResponse from "../../ServerResponse";
import XQModule from "../XQModule";
import XQSDK from "../../XQSDK";
import { XQServices } from "../../XQServicesEnum";
import handleException from "../../exceptions/handleException";

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
   * @param {Map} maybePayload - the container for the request parameters supplied to this method.
   * @param {String} id - the user id of the Contact that will be disabled
   * @returns {Promise<ServerResponse<{payload:{id:int, status:string}}>>}
   */
  supplyAsync: (maybePayload: { id: string }) => Promise<ServerResponse>;

  constructor(sdk: XQSDK) {
    super(sdk);
    this.serviceName = "contact";
    this.requiredFields = [DisableContact.ID];

    this.supplyAsync = (maybePayload) => {
      try {
        this.sdk.validateInput(maybePayload, this.requiredFields);

        const dashboardAccessToken = this.sdk.validateAccessToken(
          Destination.DASHBOARD
        );

        const additionalHeaderProperties = {
          Authorization: "Bearer " + dashboardAccessToken,
        };

        return this.sdk
          .call(
            this.sdk.DASHBOARD_SERVER_URL,
            `${this.serviceName}/${maybePayload[DisableContact.ID]}`,
            CallMethod.DELETE,
            additionalHeaderProperties,
            null,
            true,
            Destination.DASHBOARD
          )
          .then((response: ServerResponse) => {
            switch (response.status) {
              case ServerResponse.OK: {
                return response;
              }
              case ServerResponse.ERROR: {
                return handleException(response, XQServices.DisableContact);
              }
            }
          });
      } catch (exception) {
        return new Promise((resolve) =>
          resolve(handleException(exception, XQServices.DisableContact))
        );
      }
    };
  }
}

DisableContact.ID = "id";
