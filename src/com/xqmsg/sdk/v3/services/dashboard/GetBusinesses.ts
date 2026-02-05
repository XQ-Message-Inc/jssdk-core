import CallMethod from "../../CallMethod";
import ServerResponse from "../../ServerResponse";
import XQModule from "../XQModule";
import XQSDK from "../../XQSDK";
import { XQServices } from "../../XQServicesEnum";

import handleException from "../../exceptions/handleException";

/**
 * A service which is utilized to find a given user's teams/businesses
 *
 * Delta API: GET /v3/teams
 * @class [GetBusinesses]
 */
export default class GetBusinesses extends XQModule {
  /** The required fields of the payload needed to utilize the service */
  requiredFields: string[];

  /** Specified name of the service */
  serviceName: string;

  static BUSINESSES: "businesses" = "businesses";

  /**
   * @param {Map} maybePayload - the container for the request parameters supplied to this method.
   *
   * @returns {Promise<ServerResponse<{payload:{businesses:[{canAccessBusiness: boolean, domain: string, id: int, isPersonal: boolean, name: string}]}}>>}
   */
  supplyAsync: (maybePayload: null) => Promise<ServerResponse>;

  constructor(sdk: XQSDK) {
    super(sdk);
    this.serviceName = "teams";
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
            null,
            true,
          )
          .then(async (response: ServerResponse) => {
            switch (response.status) {
              case ServerResponse.OK: {
                return response;
              }
              case ServerResponse.ERROR: {
                return handleException(response, XQServices.GetBusinesses);
              }
            }
          });
      } catch (exception) {
        return new Promise((resolve) =>
          resolve(handleException(exception, XQServices.GetBusinesses)),
        );
      }
    };
  }
}
