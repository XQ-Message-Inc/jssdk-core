import CallMethod from "../../CallMethod";
import ServerResponse from "../../ServerResponse";
import XQModule from "../XQModule";
import XQSDK from "../../XQSDK";
import { XQServices } from "../../XQServicesEnum";

import handleException from "../../exceptions/handleException";

/**
 * A service which is utilized to retrieve a listing of applications associated with the user
 *
 * Delta API: GET /v3/devapps
 * @class [GetApplications]
 */
export default class GetApplications extends XQModule {
  /** The required fields of the payload needed to utilize the service */
  requiredFields: string[];

  /** Specified name of the service */
  serviceName: string;

  /** The field name representing the list of apps returned by the `GetApplications` service */
  static APPS: "apps" = "apps";

  /**
   * @param {{}} [maybePayload=null]
   * @returns {Promise<ServerResponse<{payload:{apps:[{id:int, name:string, description:string}]}}>>}
   */
  supplyAsync: (maybePayload: null) => Promise<ServerResponse>;

  constructor(sdk: XQSDK) {
    super(sdk);
    this.serviceName = "devapps";
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
            this.serviceName,
            CallMethod.GET,
            additionalHeaderProperties,
            maybePayload,
            true,
          )
          .then((response: ServerResponse) => {
            switch (response.status) {
              case ServerResponse.OK: {
                return response;
              }
              case ServerResponse.ERROR: {
                return handleException(response, XQServices.GetApplications);
              }
            }
          });
      } catch (exception) {
        return new Promise((resolve) =>
          resolve(handleException(exception, XQServices.GetApplications)),
        );
      }
    };
  }
}
