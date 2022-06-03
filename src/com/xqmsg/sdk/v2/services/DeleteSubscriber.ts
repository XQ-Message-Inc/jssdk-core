import CallMethod from "../CallMethod";
import ServerResponse from "../ServerResponse";
import XQModule from "./XQModule";
import XQSDK from "../XQSDK";
import { XQServices } from "../XQServicesEnum";

import handleException from "../exceptions/handleException";

/**
 * A service which is utilized to delete the user specified by the access token.
 * After an account is deleted, the subscriber will be sent an email notifying them of its deletion.
 *
 * @class [DeleteSubscriber]
 */
export default class DeleteSubscriber extends XQModule {
  /** The required fields of the payload needed to utilize the service */
  requiredFields: string[];

  /** Specified name of the service */
  serviceName: string;

  /**
   *
   * @param {{}} [maybePayload=null]
   * @returns {Promise<ServerResponse<{}>>}
   */
  supplyAsync: (maybePayload: null) => Promise<ServerResponse>;
  constructor(sdk: XQSDK) {
    super(sdk);

    this.serviceName = "subscriber";
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
                return handleException(response, XQServices.DeleteSubscriber);
              }
            }
          });
      } catch (exception) {
        return new Promise((resolve) =>
          resolve(handleException(exception, XQServices.DeleteSubscriber))
        );
      }
    };
  }
}
