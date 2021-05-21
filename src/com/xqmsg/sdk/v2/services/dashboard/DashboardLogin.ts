import XQModule from "../XQModule";
import CallMethod from "../../CallMethod";
import Destination from "../../Destination";
import ServerResponse from "../../ServerResponse";
import XQSDK from "../../XQSDK";

/**
 * Log into Dashboard Application<br>
 * This requires you to previously have been authorized via <br>
 *   * {@link Authorize}
 *   * {@link ValidatePacket}
 *   * {@link ExchangeForAccessToken}
 *
 *   @class [DashboardLogin]
 */
export default class DashboardLogin extends XQModule {
  serviceName: string;
  requiredFields: string[];
  supplyAsync: (maybePayLoad: Record<string, any>) => ServerResponse;
  static REQUEST: string;

  constructor(sdk: XQSDK) {
    super(sdk);
    this.serviceName = "login/verify";
    this.requiredFields = [];

    /**
     * @param {Map} [maybePayLoad=null] - Container for the request parameters supplied to this method.
     *
     * @returns {Promise<ServerResponse<{payload:String}>>}
     */
    this.supplyAsync = (maybePayLoad) => {
      try {
        let self = this;

        let xqAccessToken = this.sdk.validateAccessToken();

        let additionalHeaderProperties = {
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
                let dashboardAccessToken = exchangeResponse.payload;
                try {
                  let activeProfile = self.cache.getActiveProfile(true);
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

DashboardLogin.REQUEST = "request";
