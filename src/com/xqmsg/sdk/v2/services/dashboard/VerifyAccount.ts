import jwtDecode, { JwtPayload } from "jwt-decode";

import CallMethod from "../../CallMethod";
import Destination from "../../Destination";
import ServerResponse from "../../ServerResponse";
import ValidateSession from "./ValidateSession";
import XQModule from "../XQModule";
import XQSDK from "../../XQSDK";
import { XQServices } from "../../XQServicesEnum";

import handleException from "../../exceptions/handleException";
import verifyJWTExpiration from "../../utils/verifyJWTExpiration";

enum DashboardAccessToken {
  preAuth = "preauth-dashboard",
  auth = "dashboard",
}

/**
 * A service utilized to verify a user via their `accessToken` saved in-memory and allow access to Dashboard services.
 * @class [DashboardLogin]
 */
export default class VerifyAccount extends XQModule {
  /** The required fields of the payload needed to utilize the service */
  requiredFields: string[];

  /** Specified name of the service */
  serviceName: string;

  /** The field name representing an access token */
  static ACCESS_TOKEN: "accessToken" = "accessToken";

  /**
   * @param {Map} maybePayload - the container for the request parameters supplied to this method.
   * @param {String} maybePayload.accesstoken - the provided access token
   * @returns {Promise<ServerResponse<{payload:string}>>}
   */
  supplyAsync: (maybePayload: {
    [VerifyAccount.ACCESS_TOKEN]: string;
  }) => Promise<ServerResponse>;

  constructor(sdk: XQSDK) {
    super(sdk);
    this.serviceName = "login/verify";
    this.requiredFields = [VerifyAccount.ACCESS_TOKEN];

    this.supplyAsync = (maybePayload) => {
      try {
        this.sdk.validateInput(maybePayload, this.requiredFields);

        const self = this;

        const accessToken = maybePayload[VerifyAccount.ACCESS_TOKEN];

        const isAccessTokenExpired: boolean = verifyJWTExpiration(accessToken);

        if (isAccessTokenExpired) {
          return new Promise((resolve) => {
            resolve(
              new ServerResponse(ServerResponse.ERROR, 401, {
                payload: "access token expired",
              })
            );
          });
        }

        const validateSession = async (
          profile: string,
          dashboardAccessToken: string
        ) => {
          // Verify that the session is valid before proceeding
          const response = await new ValidateSession(this.sdk).supplyAsync({
            accessToken: dashboardAccessToken,
          });

          switch (response.status) {
            case ServerResponse.OK: {
              return new ServerResponse(ServerResponse.OK, 200, {
                user: profile,
                dashboardAccessToken,
              });
            }
            case ServerResponse.ERROR: {
              self.cache.removeDashboardAccess(profile);
              self.cache.removeProfile(profile);

              return handleException(response, XQServices.VerifyAccount);
            }
          }
        };

        const additionalHeaderProperties = {
          Authorization: `Bearer ${accessToken}`,
        };

        const decodedIncomingAccessToken: JwtPayload = jwtDecode(accessToken);

        // if user has an already existing dashboard token
        // skip pre-auth dashboard token exchange process
        if (decodedIncomingAccessToken.iss === DashboardAccessToken.auth) {
          const profile = decodedIncomingAccessToken.sub || "";

          self.cache.putActiveProfile(profile);
          self.cache.putDashboardAccess(profile, accessToken);

          return validateSession(profile, accessToken);
        }

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
                const dashboardAccessToken = response.payload;
                const decodedJWTPayload: JwtPayload = jwtDecode(
                  response.payload
                );

                const profile = decodedJWTPayload.sub || "";

                self.cache.putActiveProfile(profile);
                self.cache.putDashboardAccess(profile, dashboardAccessToken);

                await validateSession(profile, accessToken);

                return response;
              }
              case ServerResponse.ERROR: {
                return handleException(response, XQServices.VerifyAccount);
              }
            }
          });
      } catch (exception) {
        return new Promise((resolve) =>
          resolve(handleException(exception, XQServices.VerifyAccount))
        );
      }
    };
  }
}
