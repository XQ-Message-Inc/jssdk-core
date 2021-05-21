import CallMethod from "../CallMethod";
import ExchangeForAccessToken from "./ExchangeForAccessToken";
import ServerResponse from "../ServerResponse";
import XQModule, { SupplyAsync } from "./XQModule";
import XQSDK from "../XQSDK";

/**
 * Authenticate the PIN which resulted from the preceding {@link Authorize} service call.<br>
 * If successful this service returns a server response containing the access token.
 *
 * @class [CodeValidator]
 */
export default class CodeValidator extends XQModule {
  requiredFields: string[];
  serviceName: string;
  static PIN: string;
  supplyAsync: SupplyAsync;

  constructor(sdk: XQSDK) {
    super(sdk);

    this.serviceName = "codevalidation";
    this.requiredFields = [CodeValidator.PIN];

    /**
     * @param {Map} maybePayLoad - Container for the request parameters supplied to this method.
     * @param {String} maybePayLoad.pin - Pin to validate the access request
     *
     * @returns {Promise<ServerResponse<{payload:String}>>}  the server response containing the access token
     */
    this.supplyAsync = (maybePayLoad) => {
      try {
        let self = this;
        this.sdk.validateInput(maybePayLoad, this.requiredFields);
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
          .then((validationResponse: ServerResponse) => {
            switch (validationResponse.status) {
              case ServerResponse.OK: {
                return new ExchangeForAccessToken(self.sdk).supplyAsync({});
              }
              case ServerResponse.ERROR: {
                console.info(validationResponse);
                return validationResponse;
              }
            }
          });
      } catch (exception) {
        return new Promise((resolve, reject) => {
          resolve(
            new ServerResponse(
              ServerResponse.ERROR,
              exception.code,
              exception.reason
            )
          );
        });
      }
    };
  }
}

/**Pin to validate the access request*/
CodeValidator.PIN = "pin";
