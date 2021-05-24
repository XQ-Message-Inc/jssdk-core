import CallMethod from "../../CallMethod";
import Destination from "../../Destination";
import ServerResponse from "../../ServerResponse";
import XQModule from "../XQModule";
import XQSDK from "../../XQSDK";

/**
 * A service utilized to log a user into Dashboard application
 * This requires the user to previously have been authorized via
 *   * `Authorize`
 *   * `ValidatePacket`
 *   * `ExchangeForAccessToken`
 *
 *   @class [DashboardLogin]
 */
export default class DashboardLogin extends XQModule {
  /** The required fields of the payload needed to utilize the service */
  requiredFields: string[];

  /** Specified name of the service */
  serviceName: string;

  /** The field name representing the represent */
  static REQUEST: "request";

  /**
   * @param {Map} [maybePayLoad=null] - Container for the request parameters supplied to this method.
   * @returns {Promise<ServerResponse<{payload:String}>>}
   */
  supplyAsync: (maybePayLoad: null) => Promise<ServerResponse>;

  constructor(sdk: XQSDK) {
    super(sdk);
    this.serviceName = "login/verify";
    this.requiredFields = [];

    this.supplyAsync = () => {
      try {
        const self = this;

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
          .then((exchangeResponse: ServerResponse) => {
            switch (exchangeResponse.status) {
              case ServerResponse.OK: {
                const dashboardAccessToken = exchangeResponse.payload;
                try {
                  const activeProfile = self.cache.getActiveProfile(true);
                  self.cache.putDashboardAccess(
                    activeProfile,
                    dashboardAccessToken
                  );
                  return exchangeResponse;
                } catch (e) {
                  console.log(e.message);
                  return null;
                }
              }
              default: {
                return exchangeResponse;
              }
            }
          });
      } catch (exc) {
        return new Promise((resolve) => {
          resolve(
            new ServerResponse(ServerResponse.ERROR, exc.code, exc.reason)
          );
        });
      }
    };
  }
}
