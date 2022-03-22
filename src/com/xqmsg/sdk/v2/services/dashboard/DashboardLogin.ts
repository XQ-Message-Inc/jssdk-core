import jwtDecode, { JwtPayload } from "jwt-decode";

import CallMethod from "../../CallMethod";
import Destination from "../../Destination";
import ServerResponse from "../../ServerResponse";
import XQModule from "../XQModule";
import XQSDK from "../../XQSDK";

/**
 * A service utilized to log-in a user and allow access to Dashboard services.
 * @class [DashboardLogin]
 */
export default class DashboardLogin extends XQModule {
  /** The required fields of the payload needed to utilize the service */
  requiredFields: string[];

  /** Specified name of the service */
  serviceName: string;

  /** The field name representing the authenticated credential */
  static CREDENTIAL: "credential" = "credential";

  /**
   * @param {Map} maybePayLoad - the container for the request parameters supplied to this method.
   * @param {String} maybePayLoad.credential - the provided OAuth token
   * @returns {Promise<ServerResponse<{payload:string}>>}
   */
  supplyAsync: (maybePayLoad: {
    [DashboardLogin.CREDENTIAL]: string;
  }) => Promise<ServerResponse>;

  constructor(sdk: XQSDK) {
    super(sdk);
    this.serviceName = "login";
    this.requiredFields = [DashboardLogin.CREDENTIAL];

    this.supplyAsync = (maybePayLoad) => {
      try {
        const self = this;
        this.sdk.validateInput(maybePayLoad, this.requiredFields);

        const loginRequest = {
          method: 1, // TODO(worstestes - 3.21.22): an obselete field which will be removed at a later date
          [DashboardLogin.CREDENTIAL]: maybePayLoad.credential,
        };

        return this.sdk
          .call(
            this.sdk.DASHBOARD_SERVER_URL,
            this.serviceName,
            CallMethod.POST,
            null,
            loginRequest,
            true,
            Destination.DASHBOARD
          )
          .then(async (exchangeResponse: ServerResponse) => {
            switch (exchangeResponse.status) {
              case ServerResponse.OK: {
                const dashboardAccessToken = exchangeResponse.payload;
                try {
                  const decodedJWTPayload: JwtPayload = jwtDecode(
                    exchangeResponse.payload
                  );

                  const profile = decodedJWTPayload.sub;

                  await self.cache.putActiveProfile(profile);

                  const activeProfile = self.cache.getActiveProfile(true);

                  self.cache.putDashboardAccess(
                    activeProfile,
                    dashboardAccessToken
                  );
                  return exchangeResponse;
                } catch (e) {
                  console.log(e);
                  return null;
                }
              }
              case ServerResponse.ERROR: {
                console.error(
                  `VerifyAccount failed, code: ${exchangeResponse.statusCode}, reason: ${exchangeResponse.payload}`
                );
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
