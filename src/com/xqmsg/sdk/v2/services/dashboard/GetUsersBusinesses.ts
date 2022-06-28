import CallMethod from "../../CallMethod";
import Destination from "../../Destination";
import ServerResponse from "../../ServerResponse";
import XQModule from "../XQModule";
import XQSDK from "../../XQSDK";
import { XQServices } from "../../XQServicesEnum";

import handleException from "../../exceptions/handleException";

/**
 * A service which is utilized to fetch the businesses/workspaces that a user belongs to.
 *
 * @class [GetUsersBusinesses]
 */
export default class GetUsersBusinesses extends XQModule {
  /** The required fields of the payload needed to utilize the service */
  requiredFields: string[];

  /** Specified name of the service */
  serviceName: string;

  /** Email of the user whose workspaces we are querying for */
  static EMAIL: "email" = "email";

  /**
   * @param {Map} maybePayload - the container for the request parameters supplied to this method.
   * @returns {Promise<ServerResponse<{payload: CurrentBusinessSummary}>>}
   */
  supplyAsync: (maybePayload: {
    [GetUsersBusinesses.EMAIL]: string;
  }) => Promise<ServerResponse>;

  constructor(sdk: XQSDK) {
    super(sdk);
    this.serviceName = "workspaces";
    this.requiredFields = [GetUsersBusinesses.EMAIL];

    this.supplyAsync = (maybePayload) => {
      try {
        this.sdk.validateInput(maybePayload, this.requiredFields);

        return this.sdk
          .call(
            this.sdk.DASHBOARD_SERVER_URL,
            this.serviceName + `/${maybePayload[GetUsersBusinesses.EMAIL]}`,
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
                return handleException(response, XQServices.GetUsersBusinesses);
              }
            }
          });
      } catch (exception) {
        return new Promise((resolve) =>
          resolve(handleException(exception, XQServices.GetUsersBusinesses))
        );
      }
    };
  }
}
