import CallMethod from "../../CallMethod";
import ServerResponse from "../../ServerResponse";
import XQModule from "../XQModule";
import XQSDK from "../../XQSDK";
import { XQServices } from "../../XQServicesEnum";

import handleException from "../../exceptions/handleException";

/**
 * A service which is utilized to create a new developer application.
 *
 * Delta API: POST /v3/devapp
 * @class [AddApplication]
 */
export default class AddApplication extends XQModule {
  /** The required fields of the payload needed to utilize the service */
  requiredFields: string[];

  /** Specified name of the service */
  serviceName: string;

  /** The field name representing the name of the application */
  static NAME: "name" = "name";

  /** The field name representing the description of the application */
  static DESC: "desc" = "desc";

  /**
   * @param {Map} maybePayload - the container for the request parameters supplied to this method.
   * @param {String} name - the name of the application
   * @param {String} desc - the description of the application
   * @returns {Promise<ServerResponse<{payload:{id: int}}>>}
   */
  supplyAsync: (maybePayload: {
    [AddApplication.NAME]: string;
    [AddApplication.DESC]?: string;
  }) => Promise<ServerResponse>;

  constructor(sdk: XQSDK) {
    super(sdk);
    this.serviceName = "devapp";
    this.requiredFields = [AddApplication.NAME];

    this.supplyAsync = (maybePayload) => {
      try {
        this.sdk.validateInput(maybePayload, this.requiredFields);

        const accessToken = this.sdk.validateAccessToken();

        const additionalHeaderProperties = {
          Authorization: "Bearer " + accessToken,
        };

        return this.sdk
          .call(
            this.serviceName,
            CallMethod.POST,
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
                return handleException(response, XQServices.AddApplication);
              }
            }
          });
      } catch (exception) {
        return new Promise((resolve) =>
          resolve(handleException(exception, XQServices.AddApplication))
        );
      }
    };
  }
}
