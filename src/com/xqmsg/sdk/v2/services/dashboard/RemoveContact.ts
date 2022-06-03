import CallMethod from "../../CallMethod";
import Destination from "../../Destination";
import ServerResponse from "../../ServerResponse";
import XQModule from "../XQModule";
import XQSDK from "../../XQSDK";
import { XQServices } from "../../XQServicesEnum";

import handleException from "../../exceptions/handleException";

/**
 * A service which is utilized to remove an existing Contact
 *
 * @class [RemoveContact]
 */
export default class RemoveContact extends XQModule {
  /** The required fields of the payload needed to utilize the service */
  requiredFields: string[];

  /** Specified name of the service */
  serviceName: string;

  /** The field name representing the id */
  static ID: "id" = "id";

  /**
   * @param {Map} maybePayload - the container for the request parameters supplied to this method.
   * @param {String} id - the user id of the Contact that will be removed
   * @returns {Promise<ServerResponse<{payload:{}}>>}
   */
  supplyAsync: (maybePayload: {
    [RemoveContact.ID]: string;
  }) => Promise<ServerResponse>;

  constructor(sdk: XQSDK) {
    super(sdk);
    this.serviceName = "contact";
    this.requiredFields = [RemoveContact.ID];

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
            `${this.serviceName}/${maybePayload[RemoveContact.ID]}?delete=true`,
            CallMethod.DELETE,
            additionalHeaderProperties,
            null,
            true,
            Destination.DASHBOARD
          )
          .then(async (response: ServerResponse) => {
            switch (response.status) {
              case ServerResponse.OK: {
                return response;
              }
              case ServerResponse.ERROR: {
                return handleException(response, XQServices.RemoveContact);
              }
            }
          });
      } catch (exception) {
        return new Promise((resolve) =>
          resolve(handleException(exception, XQServices.RemoveContact))
        );
      }
    };
  }
}
