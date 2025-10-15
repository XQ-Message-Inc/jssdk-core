import jwtDecode, { JwtPayload } from "jwt-decode";

import CallMethod from "../../shared/CallMethod";
import ServerResponse from "../../shared/ServerResponse";
import XQModule from "./XQModule";
import XQSDK from "../XQSDK";
import { XQServices } from "../../shared/XQServicesEnum";

import handleException from "../../shared/exceptions/handleException";



/**
 *  A service which is utilized to exchange a temporary access token with a real access token used in all secured XQ Message interactions
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
    this.serviceName = "exchange";
    this.requiredFields = [];

    this.supplyAsync = (teamId) => {
      try {
        this.sdk.validateInput({}, this.requiredFields);

        const self = this;

        const preAuthToken = this.sdk.validatePreAuthToken();

        const additionalHeaderProperties = {
          Authorization: "Bearer " + preAuthToken,
        };

        const payload = teamId !== undefined ? { b: teamId.toString() } : null;
        
        return this.sdk
          .call(
            this.sdk.SUBSCRIPTION_SERVER_URL,
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
