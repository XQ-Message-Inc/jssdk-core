import CallMethod from "../../CallMethod";
import Destination from "../../Destination";
import ServerResponse from "../../ServerResponse";
import XQModule from "../XQModule";
import XQSDK from "../../XQSDK";
import { XQServices } from "../../XQServicesEnum";

import handleException from "../../exceptions/handleException";

/**
 * A service which is utilized to remove a grouping of dashboard users
 *
 * @class [RemoveUserGroup]
 */
export default class RemoveUserGroup extends XQModule {
  /** The required fields of the payload needed to utilize the service */
  requiredFields: string[];

  /** Specified name of the service */
  serviceName: string;

  /** A field name representing the id of the user group to be removed */
  static ID: "id" = "id";

  /**
   * @param {Map} maybePayLoad - Container for the request parameters supplied to this method.
   * @returns {Promise<ServerResponse<{payload:{}>>}
   */
  supplyAsync: (maybePayload: { id: string }) => Promise<ServerResponse>;

  constructor(sdk: XQSDK) {
    super(sdk);
    this.serviceName = "usergroup";
    this.requiredFields = [RemoveUserGroup.ID];

    this.supplyAsync = (maybePayLoad) => {
      try {
        this.sdk.validateInput(maybePayLoad, this.requiredFields);

        const dashboardAccessToken = this.sdk.validateAccessToken(
          Destination.DASHBOARD
        );

        const additionalHeaderProperties = {
          Authorization: "Bearer " + dashboardAccessToken,
        };

        return this.sdk
          .call(
            this.sdk.DASHBOARD_SERVER_URL,
            this.serviceName + "/" + maybePayLoad[RemoveUserGroup.ID],
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
                return handleException(response, XQServices.RemoveUserGroup);
              }
            }
          });
      } catch (exception) {
        return new Promise((resolve) =>
          resolve(handleException(exception, XQServices.RemoveUserGroup))
        );
      }
    };
  }
}
