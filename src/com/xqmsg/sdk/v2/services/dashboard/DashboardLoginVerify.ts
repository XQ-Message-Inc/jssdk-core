import CallMethod from "../../CallMethod";
import Destination from "../../Destination";
import ServerResponse from "../../ServerResponse";
import XQModule from "../XQModule";
import XQSDK from "../../XQSDK";
import { XQServices } from "../../XQServicesEnum";

import handleException from "../../exceptions/handleException";

/**
 * Log into Dashboard Application using the xq access token <br>
 * This requires you to previously have been authorized via <br>
 *   * {@link Authorize}
 *   * {@link ValidatePacket}
 *   * {@link ExchangeForAccessToken}
 *
 *   @class [DashboardLoginVerify]
 */
export default class DashboardLoginVerify extends XQModule {
  /** The required fields of the payload needed to utilize the service */
  requiredFields: string[];

  /** Specified name of the service */
  serviceName: string;

  /** The field name representing the service name */
  static LOGIN_VERIFY: "login/verify" = "login/verify";

  /**
   * @param {Map} [maybePayLoad=null] - Container for the request parameters supplied to this method.
   *
   * @returns {Promise<ServerResponse<{payload:string}>>}
   */
  supplyAsync: (maybePayload: null) => Promise<ServerResponse>;

  constructor(sdk: XQSDK) {
    super(sdk);
    this.serviceName = DashboardLoginVerify.LOGIN_VERIFY;
    this.requiredFields = [];

    this.supplyAsync = (maybePayload) => {
      try {
        const self = this;

        this.sdk.validateInput(maybePayload, this.requiredFields);
        const xqAccessToken = this.sdk.validateAccessToken();

        const additionalHeaderProperties = {
          Authorization: "Bearer " + xqAccessToken,
        };

        return this.sdk
          .call(
            this.sdk.DASHBOARD_SERVER_URL,
            this.serviceName,
            CallMethod.GET,
            additionalHeaderProperties,
            { request: "sub" },
            true,
            Destination.DASHBOARD
          )
          .then(async (response: ServerResponse) => {
            switch (response.status) {
              case ServerResponse.OK: {
                const dashboardAccessToken = response.payload;
                try {
                  const activeProfile = self.cache.getActiveProfile(true);
                  self.cache.putDashboardAccess(
                    activeProfile,
                    dashboardAccessToken
                  );
                  return response;
                } catch (e) {
                  console.log(e);
                  return null;
                }
              }
              default: {
                return response;
              }
            }
          });
      } catch (exception) {
        return new Promise((resolve) =>
          resolve(handleException(exception, XQServices.DashboardLogin))
        );
      }
    };
  }
}
