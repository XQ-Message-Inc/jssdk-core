import XQModule from "./XQModule.js";
import CallMethod from "./../CallMethod.js";
import ServerResponse from "./../ServerResponse.js";

/**
 *  Exchange the temporary access token with a real access token used in all secured XQ Message interactions
 *  @class [ExchangeForAccessToken]
 */
export default class ExchangeForAccessToken extends XQModule {
  constructor(sdk) {
    super(sdk);
    this.serviceName = "exchange";
    this.requiredFields = [];

    /**
     * @param {Map} [maybePayLoad=null] - Container for the request parameters supplied to this method.
     *
     * @returns {Promise<ServerResponse<{payload:String}>>}
     */
    this.supplyAsync = (maybePayLoad) => {
      try {
        let self = this;

        let preAuthToken = this.sdk.validatePreAuthToken();

        let additionalHeaderProperties = {
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
          .then((exchangeResponse) => {
            switch (exchangeResponse.status) {
              case ServerResponse.OK: {
                let accessToken = exchangeResponse.payload;
                try {
                  let activeProfile = self.cache.getActiveProfile(true);
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
