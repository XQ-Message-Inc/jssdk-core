import CallMethod from "../CallMethod";
import ServerResponse from "../ServerResponse";
import XQModule from "./XQModule";
import XQSDK from "../XQSDK";

/**
 *  A service which is used to exchange a temporary access token with a real access token used in all secured XQ Message interactions
 *  @class [ExchangeForAccessToken]
 */
export default class ExchangeForAccessToken extends XQModule {
  serviceName: string;
  requiredFields: string[];
  /**
   * @param {Map} [maybePayLoad=null] - Container for the request parameters supplied to this method.
   *
   * @returns {Promise<ServerResponse<{payload:String}>>}
   */
  supplyAsync: (maybePayload: null) => Promise<ServerResponse>;

  constructor(sdk: XQSDK) {
    super(sdk);
    this.serviceName = "exchange";
    this.requiredFields = [];

    this.supplyAsync = (maybePayLoad) => {
      try {
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
            maybePayLoad,
            true
          )
          .then((exchangeResponse: ServerResponse) => {
            switch (exchangeResponse.status) {
              case ServerResponse.OK: {
                const accessToken = exchangeResponse.payload;
                try {
                  const activeProfile = self.cache.getActiveProfile(true);
                  self.cache.putXQAccess(activeProfile, accessToken);
                  self.cache.removeXQPreAuthToken(activeProfile);
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
