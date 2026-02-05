import CallMethod from "../../CallMethod";
import ServerResponse from "../../ServerResponse";
import XQModule from "../XQModule";
import XQSDK from "../../XQSDK";
import { XQServices } from "../../XQServicesEnum";

import handleException from "../../exceptions/handleException";

/**
 * A service which is utilized to remove a grouping of users
 *
 * Delta API: DELETE /v3/group/{id}
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
   * @param {Map} maybePayload - the container for the request parameters supplied to this method.
   * @returns {Promise<ServerResponse<{payload:{}>>}
   */
  supplyAsync: (maybePayload: { id: string }) => Promise<ServerResponse>;

  constructor(sdk: XQSDK) {
    super(sdk);
    this.serviceName = "group";
    this.requiredFields = [RemoveUserGroup.ID];

    this.supplyAsync = (maybePayload) => {
      try {
        this.sdk.validateInput(maybePayload, this.requiredFields);

        const accessToken = this.sdk.validateAccessToken();

        const additionalHeaderProperties = {
          Authorization: "Bearer " + accessToken,
        };

        return this.sdk
          .call(
            this.serviceName + "/" + maybePayload[RemoveUserGroup.ID],
            CallMethod.DELETE,
            additionalHeaderProperties,
            null,
            true,
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
          resolve(handleException(exception, XQServices.RemoveUserGroup)),
        );
      }
    };
  }
}
