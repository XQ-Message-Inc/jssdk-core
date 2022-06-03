import CallMethod from "../CallMethod";
import ExchangeForAccessToken from "./ExchangeForAccessToken";
import ServerResponse from "../ServerResponse";
import XQModule from "./XQModule";
import XQSDK from "../XQSDK";
import { XQServices } from "../XQServicesEnum";

import handleException from "../exceptions/handleException";

/**
 * A service which is utilized to authenticate the two-factor PIN which resulted from the preceding {@link Authorize} service call.
 * If successful this service returns a `ServerResponse` containing the access token.
 *
 * @class [CodeValidator]
 */
export default class CodeValidator extends XQModule {
  /** The required fields of the payload needed to utilize the service */
  requiredFields: string[];

  /** Specified name of the service */
  serviceName: string;

  /** The field name representing the two-factor pin used to validate the `Authorize` service request */
  static PIN: "pin" = "pin";

  /**
   * @param {Map} maybePayload - the container for the request parameters supplied to this method.
   * @param {String} maybePayload.pin - the two-factor pin used to validate the `Authorize` service request
   *
   * @returns {Promise<ServerResponse<{payload:String}>>} a `ServerResponse` containing the access token
   */
  supplyAsync: (maybePayload: { pin: string }) => Promise<ServerResponse>;

  constructor(sdk: XQSDK) {
    super(sdk);

    this.serviceName = "codevalidation";
    this.requiredFields = [CodeValidator.PIN];

    this.supplyAsync = (maybePayload) => {
      try {
        this.sdk.validateInput(maybePayload, this.requiredFields);
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
                return new ExchangeForAccessToken(self.sdk).supplyAsync(null);
              }
              case ServerResponse.ERROR: {
                return handleException(response, XQServices.CodeValidator);
              }
            }
          });
      } catch (exception) {
        return new Promise((resolve) =>
          resolve(handleException(exception, XQServices.CodeValidator))
        );
      }
    };
  }
}
