import CallMethod from "../../CallMethod";
import Destination from "../../Destination";
import ServerResponse from "../../ServerResponse";
import XQModule from "../XQModule";
import XQSDK from "../../XQSDK";
import { XQServices } from "../../XQServicesEnum";

import handleException from "../../exceptions/handleException";

/**
 * A service which is utilized to return the currently logged in user's data
 *
 * @class [GetCurrentUser]
 */
export default class GetCurrentUser extends XQModule {
  /** The required fields of the payload needed to utilize the service */
  requiredFields: string[];

  /** Specified name of the service */
  serviceName: string;

  /** The field name repreesnting the service name */
  static CONTACT: "contact" = "contact";

  /**
   * @param {Map} maybePayLoad - Container for the request parameters supplied to this method.
   * @returns {Promise<ServerResponse<{payload: ContactSummary }>>}
   */
  supplyAsync: (maybePayload: null) => Promise<ServerResponse>;

  constructor(sdk: XQSDK) {
    super(sdk);
    this.serviceName = GetCurrentUser.CONTACT;
    this.requiredFields = [];

    this.supplyAsync = () => {
      try {
        const self = this;

        const dashboardAccessToken = this.sdk.validateAccessToken(
          Destination.DASHBOARD
        );

        const additionalHeaderProperties = {
          Authorization: "Bearer " + dashboardAccessToken,
        };

        const activeProfile = self.cache.getActiveProfile(true);

        return this.sdk
          .call(
            this.sdk.DASHBOARD_SERVER_URL,
            this.serviceName + `?filter=${activeProfile}`,
            CallMethod.GET,
            additionalHeaderProperties,
            null,
            true,
            Destination.DASHBOARD
          )
          .then(async (response: ServerResponse) => {
            switch (response.status) {
              case ServerResponse.OK: {
                // There should only be 1 user per email address, so let's just grab the first one no matter what.
                const contact = response.payload.contacts[0];
                if (!contact) {
                  // We couldn't wind a user with this email address. This should never happen but
                  // we need to account for the possibility. Throwing here will trigger the same error handling as
                  // if the request failed.
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
