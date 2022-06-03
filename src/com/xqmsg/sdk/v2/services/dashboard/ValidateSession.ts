import CallMethod from "../../CallMethod";
import Destination from "../../Destination";
import ServerResponse from "../../ServerResponse";
import XQModule from "../XQModule";
import XQSDK from "../../XQSDK";
import { XQServices } from "../../XQServicesEnum";

import handleException from "../../exceptions/handleException";

/**
 * A service which is utilized to validate the current dashboard session
 * @class [ValidateSession]
 */
export default class ValidateSession extends XQModule {
  /** The required fields of the payload needed to utilize the service */
  requiredFields: string[];

  /** Specified name of the service */
  serviceName: string;

  /** The field name representing an access token */
  static ACCESS_TOKEN: "accessToken" = "accessToken";

  /**
   * @param {Map} maybePayload - the container for the request parameters supplied to this method.
   * @param {String} maybePayload.accesstoken - the provided access token
   * @returns {Promise<ServerResponse<{payload: string; status: ServerResponse.OK | ServerResponse.ERROR; statusCode: number; }>>}
   */
  supplyAsync: (maybePayload: {
    accessToken?: string;
  }) => Promise<ServerResponse>;

  constructor(sdk: XQSDK) {
    super(sdk);
    this.serviceName = "session";
    this.requiredFields = [];

    this.supplyAsync = (maybePayload) => {
      try {
        this.sdk.validateInput(maybePayload, this.requiredFields);

        // the `suppliedDashboardAccessToken` is the (optional) provided access token to test against
        const suppliedDashboardAccessToken =
          maybePayload[ValidateSession.ACCESS_TOKEN];

        // the `savedDashboardAccessToken` is the dashboard access token that may be saved in-memory
        const savedDashboardAccessToken = this.sdk.validateAccessToken(
          Destination.DASHBOARD
        );

        // we default to the supplied access token if provided, else we test against the saved, in-memory access token
        const dashboardAccessToken = suppliedDashboardAccessToken
          ? suppliedDashboardAccessToken
          : savedDashboardAccessToken;

        const additionalHeaderProperties = {
          Authorization: "Bearer " + dashboardAccessToken,
        };

        return this.sdk
          .call(
            this.sdk.DASHBOARD_SERVER_URL,
            this.serviceName,
            CallMethod.GET,
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
                return handleException(response, XQServices.ValidateSession);
              }
            }
          });
      } catch (exception) {
        return new Promise((resolve) =>
          resolve(handleException(exception, XQServices.ValidateSession))
        );
      }
    };
  }
}
