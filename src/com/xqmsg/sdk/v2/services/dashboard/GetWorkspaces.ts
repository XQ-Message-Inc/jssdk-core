import CallMethod from "../../CallMethod";
import Destination from "../../Destination";
import ServerResponse from "../../ServerResponse";
import XQModule from "../XQModule";
import XQSDK from "../../XQSDK";
import { XQServices } from "../../XQServicesEnum";

import handleException from "../../exceptions/handleException";

/**
 * A service which is utilized to fetch the workspaces that a user belongs to.
 *
 * @class [GetWorkspaces]
 */
export default class GetWorkspaces extends XQModule {
  /** The required fields of the payload needed to utilize the service */
  requiredFields: string[];

  /** Specified name of the service */
  serviceName: string;

  /** The service name */
  static WORKSPACES: "workspaces" = "workspaces";

  /** Email of the user whose workspaces we are querying for */
  static EMAIL: "email" = "email";

  /**
   * @param {Map} maybePayload - the container for the request parameters supplied to this method.
   * @returns {Promise<ServerResponse<{payload: WorkspaceSummary[]}>>}
   */
  supplyAsync: (maybePayload: {
    [GetWorkspaces.EMAIL]: string;
  }) => Promise<ServerResponse>;

  constructor(sdk: XQSDK) {
    super(sdk);
    this.serviceName = GetWorkspaces.WORKSPACES;
    this.requiredFields = [GetWorkspaces.EMAIL];

    this.supplyAsync = (maybePayload) => {
      try {
        this.sdk.validateInput(maybePayload, this.requiredFields);

        return this.sdk
          .call(
            this.sdk.DASHBOARD_SERVER_URL,
            this.serviceName + `/${maybePayload[GetWorkspaces.EMAIL]}`,
            CallMethod.GET,
            null,
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
                return handleException(response, XQServices.GetWorkspaces);
              }
            }
          });
      } catch (exception) {
        return new Promise((resolve) =>
          resolve(handleException(exception, XQServices.GetWorkspaces))
        );
      }
    };
  }
}
