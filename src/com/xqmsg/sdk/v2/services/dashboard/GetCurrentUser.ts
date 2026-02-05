import CallMethod from "../../CallMethod";
import ServerResponse from "../../ServerResponse";
import XQModule from "../XQModule";
import XQSDK from "../../XQSDK";
import { XQServices } from "../../XQServicesEnum";

import handleException from "../../exceptions/handleException";

/**
 * A service which is utilized to return the currently logged in user's data
 *
 * Delta API: GET /v3/user
 * @class [GetCurrentUser]
 */
export default class GetCurrentUser extends XQModule {
  /** The required fields of the payload needed to utilize the service */
  requiredFields: string[];

  /** Specified name of the service */
  serviceName: string;

  /** The field name representing the service name */
  static CONTACT: "contact" = "contact";

  /**
   * @param {Map} maybePayload - the container for the request parameters supplied to this method.
   * @returns {Promise<ServerResponse<{payload: ContactSummary }>>}
   */
  supplyAsync: (maybePayload: null) => Promise<ServerResponse>;

  constructor(sdk: XQSDK) {
    super(sdk);
    this.serviceName = "user";
    this.requiredFields = [];

    this.supplyAsync = (maybePayload) => {
      try {
        this.sdk.validateInput(maybePayload, this.requiredFields);

        const self = this;

        const accessToken = this.sdk.validateAccessToken();

        const additionalHeaderProperties = {
          Authorization: "Bearer " + accessToken,
        };

        const activeProfile = self.cache.getActiveProfile(true);

        return this.sdk
          .call(
            this.serviceName + `?filter=${activeProfile}`,
            CallMethod.GET,
            additionalHeaderProperties,
            null,
            true
          )
          .then(async (response: ServerResponse) => {
            switch (response.status) {
              case ServerResponse.OK: {
                // There should only be 1 user per email address, so let's just grab the first one no matter what.
                const contact = response.payload.contacts?.[0] || response.payload;
                if (!contact) {
                  throw new ServerResponse(
                    ServerResponse.ERROR,
                    404,
                    `Could not find a user with that email address: ${activeProfile}`
                  );
                }
                return new ServerResponse(ServerResponse.OK, 200, { contact });
              }
              case ServerResponse.ERROR: {
                return handleException(response, XQServices.GetCurrentUser);
              }
            }
          });
      } catch (exception) {
        return new Promise((resolve) =>
          resolve(handleException(exception, XQServices.GetCurrentUser))
        );
      }
    };
  }
}
