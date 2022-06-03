import CallMethod from "../CallMethod";
import ServerResponse from "../ServerResponse";
import XQModule from "./XQModule";
import XQSDK from "../XQSDK";
import { XQServices } from "../XQServicesEnum";

import handleException from "../exceptions/handleException";

/**
 * A service which is utilized to revoke a key using its token.
 * Only the user who sent the message will be able to revoke it.
 *
 * @class [DeleteAuthorization]
 */
export default class DeleteAuthorization extends XQModule {
  /** The required fields of the payload needed to utilize the service */
  requiredFields: string[];

  /** Specified name of the service */
  serviceName: string;

  /**
   *
   * @method supplyAsync
   * @param {{}} [maybePayload=null]
   * @returns {Promise<ServerResponse<{}>>}
   */
  supplyAsync: (maybePayload: null) => Promise<ServerResponse>;

  constructor(sdk: XQSDK) {
    super(sdk);
    this.serviceName = "authorization";
    this.requiredFields = [];

    this.supplyAsync = (maybePayload) => {
      try {
        this.sdk.validateInput(maybePayload, this.requiredFields);

        const accessToken = this.sdk.validateAccessToken();

        const additionalHeaderProperties = {
          Authorization: "Bearer " + accessToken,
        };

        return this.sdk
          .call(
            this.sdk.SUBSCRIPTION_SERVER_URL,
            this.serviceName,
            CallMethod.DELETE,
            additionalHeaderProperties,
            maybePayload,
            true
          )
          .then((response: ServerResponse) => {
            switch (response.status) {
              case ServerResponse.OK: {
                return response;
              }
              case ServerResponse.ERROR: {
                return handleException(
                  response,
                  XQServices.DeleteAuthorization
                );
              }
            }
          });
      } catch (exception) {
        return new Promise((resolve) =>
          resolve(handleException(exception, XQServices.DeleteAuthorization))
        );
      }
    };
  }
}
