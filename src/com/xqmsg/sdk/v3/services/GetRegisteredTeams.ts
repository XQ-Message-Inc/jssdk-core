import CallMethod from "../../shared/CallMethod";
import Destination from "../../shared/Destination";
import ServerResponse from "../../shared/ServerResponse";
import XQModule from "../XQModule";
import XQSDKv3 from "../XQSDKv3";
import { XQServices } from "../../shared/XQServicesEnum";

import handleException from "../../shared/exceptions/handleException";

/**
 * A service which is utilized to retrieve the list of teams that the user is registered to.
 * Requires a guest access token from the LoginExchange service.
 *
 * @class [GetRegisteredTeams]
 */
export default class GetRegisteredTeams extends XQModule {
  /** The required fields of the payload needed to utilize the service */
  requiredFields: string[];

  /** Specified name of the service */
  serviceName: string;

  /**
   * @param {Map} maybePayload - the container for the request parameters supplied to this method.
   *
   * @returns {Promise<ServerResponse<{payload:Array}>>} a `ServerResponse` containing the list of registered teams
   */
  supplyAsync: (maybePayload?: {}) => Promise<ServerResponse>;

  constructor(sdk: XQSDKv3) {
    super(sdk);

    this.serviceName = "teams/registered";
    this.requiredFields = [];

    this.supplyAsync = (maybePayload = {}) => {
      try {
        this.sdk.validateInput(maybePayload, this.requiredFields);

        // Get the guest access token from cache
        const guestAccessToken = this.cache.getDeltaGuestAccess(true);

        if (!guestAccessToken) {
          throw new Error("Guest access token not found. Please complete the login flow first.");
        }

        const additionalHeaderProperties = {
          Authorization: "Bearer " + guestAccessToken,
        };

        return this.sdk
          .call(
            this.sdk.DELTA_SERVER_URL,
            this.serviceName,
            CallMethod.GET,
            additionalHeaderProperties,
            null,
            true,
            Destination.DELTA
          )
          .then((response: ServerResponse) => {
            switch (response.status) {
              case ServerResponse.OK: {
                // Parse the response if it's a JSON string
                let teams = response.payload;
                if (typeof teams === "string") {
                  try {
                    teams = JSON.parse(teams);
                  } catch (e) {
                    console.error("Failed to parse teams response:", e);
                  }
                }
                
                // Ensure we return an array
                if (!Array.isArray(teams)) {
                  teams = [];
                }
                
                // Return response with parsed payload
                return new ServerResponse(
                  ServerResponse.OK,
                  response.statusCode,
                  teams
                );
              }
              case ServerResponse.ERROR: {
                return handleException(response, XQServices.GetRegisteredTeams);
              }
              default: {
                return response;
              }
            }
          });
      } catch (exception) {
        return new Promise((resolve) =>
          resolve(handleException(exception, XQServices.GetRegisteredTeams))
        );
      }
    };
  }
}
