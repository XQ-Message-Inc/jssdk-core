import CallMethod from "../../CallMethod";
import ServerResponse from "../../ServerResponse";
import XQModule from "../XQModule";
import XQSDK from "../../XQSDK";
import { XQServices } from "../../XQServicesEnum";

import handleException from "../../exceptions/handleException";

/**
 * A service which is utilized to validate the current session
 *
 * Delta API: GET /v3/session
 * @class [ValidateSession]
 */
export default class ValidateSession extends XQModule {
  /** The required fields of the payload needed to utilize the service */
  requiredFields: string[];

  /** Specified name of the service */
  serviceName: string;

  /** The field name representing an access token */
  static ACCESS_TOKEN: "accessToken" = "accessToken";

  /**
   * @param {Map} maybePayload - the container for the request parameters supplied to this method.
   * @param {String} maybePayload.accesstoken - the provided access token
   * @returns {Promise<ServerResponse<{payload: string; status: ServerResponse.OK | ServerResponse.ERROR; statusCode: number; }>>}
   */
  supplyAsync: (maybePayload: {
    accessToken?: string;
  }) => Promise<ServerResponse>;

  constructor(sdk: XQSDK) {
    super(sdk);
    this.serviceName = "session";
    this.requiredFields = [];

    this.supplyAsync = (maybePayload) => {
      try {
        this.sdk.validateInput(maybePayload, this.requiredFields);

        // the `suppliedAccessToken` is the (optional) provided access token to test against
        const suppliedAccessToken = maybePayload[ValidateSession.ACCESS_TOKEN];

        // the `savedAccessToken` is the access token that may be saved in-memory
        const savedAccessToken = this.sdk.validateAccessToken();

        // we default to the supplied access token if provided, else we test against the saved, in-memory access token
        const accessToken = suppliedAccessToken
          ? suppliedAccessToken
          : savedAccessToken;

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
                return handleException(response, XQServices.ValidateSession);
              }
            }
          });
      } catch (exception) {
        return new Promise((resolve) =>
          resolve(handleException(exception, XQServices.ValidateSession)),
        );
      }
    };
  }
}
