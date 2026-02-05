import jwtDecode, { JwtPayload } from "jwt-decode";

import CallMethod from "../CallMethod";
import ServerResponse from "../ServerResponse";
import XQModule from "./XQModule";
import XQSDK from "../XQSDK";
import { XQServices } from "../XQServicesEnum";

import handleException from "../exceptions/handleException";



/**
 *  A service which is utilized to exchange a temporary access token with a real access token used in all secured XQ Message interactions
 *
 *  Delta API: GET /v3/login/exchange
 *  @class [ExchangeForAccessToken]
 */
export default class ExchangeForAccessToken extends XQModule {
  serviceName: string;
  requiredFields: string[];
  /**
   * @param {number} [teamId] - The specific Team ID to exchange the pre-auth token for authorization
   *
   * @returns {Promise<ServerResponse<{payload:String}>>}
   */
  supplyAsync: (teamId?: number) => Promise<ServerResponse>;

  constructor(sdk: XQSDK) {
    super(sdk);
    this.serviceName = "login/exchange";
    this.requiredFields = [];

    this.supplyAsync = (teamId) => {
      try {
        this.sdk.validateInput({}, this.requiredFields);

        const self = this;

        const preAuthToken = this.sdk.validatePreAuthToken();

        const additionalHeaderProperties = {
          Authorization: "Bearer " + preAuthToken,
        };

        const payload = teamId !== undefined ? { team: teamId.toString() } : null;

        return this.sdk
          .call(
            this.serviceName,
            CallMethod.GET,
            additionalHeaderProperties,
            payload,
            true
          )
          .then((response: ServerResponse) => {
            switch (response.status) {
              case ServerResponse.OK: {
                const accessToken = response.payload;
                const decodedIncomingAccessToken: JwtPayload =
                  jwtDecode(accessToken);
                const profile = decodedIncomingAccessToken.sub || "";

                self.cache.putXQAccess(profile, accessToken);
                self.cache.removeXQPreAuthToken();

                // Store team ID if provided
                if (teamId !== undefined) {
                  self.cache.putTeamId(teamId.toString());
                }

                return response;
              }
              case ServerResponse.ERROR: {
                return handleException(
                  response,
                  XQServices.ExchangeForAccessToken
                );
              }
            }
          });
      } catch (exception) {
        return new Promise((resolve) =>
          resolve(handleException(exception, XQServices.ExchangeForAccessToken))
        );
      }
    };
  }
}
