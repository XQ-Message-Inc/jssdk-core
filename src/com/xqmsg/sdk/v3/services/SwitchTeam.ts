import CallMethod from "../../shared/CallMethod";
import Destination from "../../shared/Destination";
import ServerResponse from "../../shared/ServerResponse";
import XQModule from "../XQModule";
import XQSDKv3 from "../XQSDKv3";
import { XQServices } from "../../shared/XQServicesEnum";

import handleException from "../../shared/exceptions/handleException";

/**
 * A service which is utilized to switch to a specific team and obtain a team-specific access token.
 * Requires a guest access token from the LoginExchange service.
 * Returns an access token, refresh code, and expiration time for the selected team.
 *
 * @class [SwitchTeam]
 */
export default class SwitchTeam extends XQModule {
  /** The required fields of the payload needed to utilize the service */
  requiredFields: string[];

  /** Specified name of the service */
  serviceName: string;

  /** The field name representing the team ID */
  static ID: "id" = "id";

  /**
   * @param {Map} maybePayload - the container for the request parameters supplied to this method.
   * @param {number|string} maybePayload.id - The ID of the team to switch to.
   *
   * @returns {Promise<ServerResponse<{access_token:string, refresh_code:string, expiration:string}>>} 
   *          a `ServerResponse` containing the access token, refresh code, and expiration time
   */
  supplyAsync: (maybePayload: {
    id: number | string;
  }) => Promise<ServerResponse>;

  constructor(sdk: XQSDKv3) {
    super(sdk);

    this.serviceName = "teams/switch";
    this.requiredFields = [SwitchTeam.ID];

    this.supplyAsync = (maybePayload) => {
      try {
        this.sdk.validateInput(maybePayload, this.requiredFields);
        const self = this;

        // Get the guest access token from cache
        const guestAccessToken = this.cache.getDeltaGuestAccess(true);

        if (!guestAccessToken) {
          throw new Error("Guest access token not found. Please complete the login flow first.");
        }

        const teamId = maybePayload[SwitchTeam.ID];

        const additionalHeaderProperties = {
          Authorization: "Bearer " + guestAccessToken,
        };

        const switchPayload = {
          [SwitchTeam.ID]: teamId.toString(),
        };

        return this.sdk
          .call(
            this.sdk.DELTA_SERVER_URL,
            this.serviceName,
            CallMethod.GET,
            additionalHeaderProperties,
            switchPayload,
            true,
            Destination.DELTA
          )
          .then((response: ServerResponse) => {
            switch (response.status) {
              case ServerResponse.OK: {
                let responseData = response.payload;

                // Parse JSON string if needed
                if (typeof responseData === "string") {
                  try {
                    responseData = JSON.parse(responseData);
                  } catch (e) {
                    // If it's just a plain token string, use it as-is
                    console.log("Response is a plain string token");
                  }
                }

                // Extract the access token, refresh code, and expiration
                const accessToken = 
                  typeof responseData === "string" 
                    ? responseData 
                    : responseData?.access_token || responseData?.accessToken;

                const refreshCode = responseData?.refresh_token;
                const expiration = responseData?.expires_in;

                if (accessToken) {
                  // Delta API tokens are JWE (encrypted) and cannot be decoded
                  // Use the active profile from cache (email used during login)
                  const profile = self.cache.getActiveProfile(false) || "";

                  if (!profile) {
                    throw new Error("Active profile not found. Please complete the login flow first.");
                  }

                  // Store the team-specific access token
                  self.cache.putDeltaAccess(profile, accessToken);

                  // Store the refresh code if provided
                  if (refreshCode) {
                    self.cache.putDeltaRefreshCode(profile, refreshCode);
                  }

                  // Store the expiration if provided
                  if (expiration) {
                    self.cache.putDeltaTokenExpiration(profile, expiration.toString());
                  }

                  // Update the active profile (keep the same profile)
                  self.cache.putActiveProfile(profile);

                  // Clear the guest access token as it's no longer needed
                  self.cache.removeDeltaGuestAccess();
                }

                return response;
              }
              case ServerResponse.ERROR: {
                return handleException(response, XQServices.SwitchTeam);
              }
              default: {
                return response;
              }
            }
          });
      } catch (exception) {
        return new Promise((resolve) =>
          resolve(handleException(exception, XQServices.SwitchTeam))
        );
      }
    };
  }
}
