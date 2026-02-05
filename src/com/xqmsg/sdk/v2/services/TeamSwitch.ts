import CallMethod from "../CallMethod";
import ServerResponse from "../ServerResponse";
import XQModule from "./XQModule";
import XQSDK from "../XQSDK";
import { XQServices } from "../XQServicesEnum";

import handleException from "../exceptions/handleException";

/**
 * A service which is utilized to switch the current user's active team.
 * This returns a new team access token for the specified team.
 *
 * Delta API: POST /v3/teams/switch
 * @class [TeamSwitch]
 */
export default class TeamSwitch extends XQModule {
  /** The required fields of the payload needed to utilize the service */
  requiredFields: string[];

  /** Specified name of the service */
  serviceName: string;

  /** The field name representing the team ID to switch to */
  static TEAM_ID: "teamId" = "teamId";

  /**
   * @param {Map} maybePayload - the container for the request parameters supplied to this method.
   * @param {number} maybePayload.teamId - The ID of the team to switch to
   *
   * @returns {Promise<ServerResponse<{payload:string}>>} a `ServerResponse` containing the new team access token
   */
  supplyAsync: (maybePayload: { teamId: number }) => Promise<ServerResponse>;

  constructor(sdk: XQSDK) {
    super(sdk);

    this.serviceName = "teams/switch";
    this.requiredFields = [TeamSwitch.TEAM_ID];

    this.supplyAsync = (maybePayload) => {
      try {
        this.sdk.validateInput(maybePayload, this.requiredFields);
        const self = this;

        const accessToken = this.sdk.validateAccessToken();

        const additionalHeaderProperties = {
          Authorization: "Bearer " + accessToken,
        };

        const payload = { team: maybePayload.teamId };

        return this.sdk
          .call(
            this.serviceName,
            CallMethod.POST,
            additionalHeaderProperties,
            payload,
            true
          )
          .then((response: ServerResponse) => {
            switch (response.status) {
              case ServerResponse.OK: {
                // Store the new team ID and access token
                const newAccessToken = response.payload;
                const activeProfile = self.cache.getActiveProfile(true);

                if (activeProfile) {
                  self.cache.putXQAccess(activeProfile, newAccessToken);
                }
                self.cache.putTeamId(maybePayload.teamId.toString());

                return response;
              }
              case ServerResponse.ERROR: {
                return handleException(response, XQServices.TeamSwitch);
              }
            }
          });
      } catch (exception) {
        return new Promise((resolve) =>
          resolve(handleException(exception, XQServices.TeamSwitch))
        );
      }
    };
  }
}
