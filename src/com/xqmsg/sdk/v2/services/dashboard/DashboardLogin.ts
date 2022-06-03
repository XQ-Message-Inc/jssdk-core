import jwtDecode, { JwtPayload } from "jwt-decode";

import CallMethod from "../../CallMethod";
import Destination from "../../Destination";
import ServerResponse from "../../ServerResponse";
import XQModule from "../XQModule";
import XQSDK from "../../XQSDK";
import { XQServices } from "../../XQServicesEnum";

import handleException from "../../exceptions/handleException";

/**
 * A service utilized to log-in a user and allow access to Dashboard services.
 * @class [DashboardLogin]
 */
export default class DashboardLogin extends XQModule {
  /** The required fields of the payload needed to utilize the service */
  requiredFields: string[];

  /** Specified name of the service */
  serviceName: string;

  /** The field name representing the service name */
  static LOGIN: "login" = "login";

  /** The field name representing the authenticated pwd */
  static PWD: "pwd" = "pwd";

  /**
   * @param {Map} maybePayload - the container for the request parameters supplied to this method.
   * @param {String} maybePayload.pwd - the provided OAuth token
   * @returns {Promise<ServerResponse<{payload:string}>>}
   */
  supplyAsync: (maybePayload: {
    [DashboardLogin.PWD]: string;
  }) => Promise<ServerResponse>;

  constructor(sdk: XQSDK) {
    super(sdk);
    this.serviceName = DashboardLogin.LOGIN;
    this.requiredFields = [DashboardLogin.PWD];

    this.supplyAsync = (maybePayload) => {
      try {
        this.sdk.validateInput(maybePayload, this.requiredFields);
        const self = this;

        const loginRequest = {
          method: 1, // TODO(worstestes - 3.21.22): an obselete field which will be removed at a later date
          [DashboardLogin.PWD]: maybePayload.pwd,
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
          .then(async (response: ServerResponse) => {
            switch (response.status) {
              case ServerResponse.OK: {
                const dashboardAccessToken = response.payload;
                const decodedJWTPayload: JwtPayload = jwtDecode(
                  response.payload
                );

                const profile = decodedJWTPayload.sub;

                await self.cache.putActiveProfile(profile);

                const activeProfile = self.cache.getActiveProfile(true);

                self.cache.putDashboardAccess(
                  activeProfile,
                  dashboardAccessToken
                );
                return new ServerResponse(ServerResponse.OK, 200, {
                  user: profile,
                  dashboardAccessToken,
                });
              }
              case ServerResponse.ERROR: {
                return handleException(response, XQServices.DashboardLogin);
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
