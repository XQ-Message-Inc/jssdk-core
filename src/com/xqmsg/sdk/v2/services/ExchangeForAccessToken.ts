import jwtDecode, { JwtPayload } from "jwt-decode";

import CallMethod from "../CallMethod";
import ServerResponse from "../ServerResponse";
import XQModule from "./XQModule";
import XQSDK from "../XQSDK";
import { XQServices } from "../XQServicesEnum";

import handleException from "../exceptions/handleException";



/**
 *  A service which is utilized to exchange a temporary access token with a real access token used in all secured XQ Message interactions
 *  @class [ExchangeForAccessToken]
 */
export default class ExchangeForAccessToken extends XQModule {
  serviceName: string;
  requiredFields: string[];
  /**
   * @param {Map} [maybePayload=null] - Container for the request parameters supplied to this method.
   *
   * @returns {Promise<ServerResponse<{payload:String}>>}
   */
  supplyAsync: (maybePayload:null) => Promise<ServerResponse>;

  constructor(sdk: XQSDK) {
    super(sdk);
    this.serviceName = "exchange";
    this.requiredFields = [];

    this.supplyAsync = (maybePayload) => {
      try {
        this.sdk.validateInput({}, this.requiredFields);

        const self = this;

        const preAuthToken = this.sdk.validatePreAuthToken();

        const additionalHeaderProperties = {
          Authorization: "Bearer " + preAuthToken,
        };

        return this.sdk
          .call(
            this.sdk.SUBSCRIPTION_SERVER_URL,
            this.serviceName,
            CallMethod.GET,
            additionalHeaderProperties,
            maybePayload,
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
