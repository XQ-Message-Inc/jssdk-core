import CallMethod from "../../CallMethod";
import Destination from "../../Destination";
import ServerResponse from "../../ServerResponse";
import XQModule from "../XQModule";
import XQSDK from "../../XQSDK";

/**
 * A service which is utilized to return all event types
 *
 * @class [GetCommunications]
 */
export default class GetCommunications extends XQModule {
  /** The required fields of the payload needed to utilize the service */
  requiredFields: string[];

  /** Specified name of the service */
  serviceName: string;

  /** The service name */
  static COMMUNICATIONS: "communications" = "communications";

  /** A regex data parameter to filter by */
  static SEARCH: "search" = "search";

  /** The date range floor (in ms) */
  static FROM: "from" = "from";

  /** The date range ceiling (in ms) */
  static TO: "to" = "to";

  /** The max number of logs to return */
  static LIMIT: "limit" = "limit";

  /** The 0-based index page offset */
  static PAGE: "page" = "page";

  /** An array of users/senders to filter by */
  static USERS: "users" = "users";

  /** An array of recipients to filter by */
  static RECIPIENTS: "recipients" = "recipients";

  /** An array of communication statuses to filter against */
  static STATUS: "status" = "status";

  /** An array of communication types to filter against */
  static TYPE: "type" = "type";

  /** An array of threat levels to filter by */
  static THREATS: "threats" = "threats";

  /** The timezone offset of the requesting client */
  static TZ: "tz" = "tz";

  /**
   * @param {Map} maybePayLoad - Container for the request parameters supplied to this method.
   * @returns {Promise<ServerResponse<{payload: EventLogItem[] }>>}
   */
  supplyAsync: (
    maybePayload: {
      [GetCommunications.FROM]?: number;
      [GetCommunications.LIMIT]?: number;
      [GetCommunications.PAGE]?: number;
      [GetCommunications.RECIPIENTS]?: string[];
      [GetCommunications.SEARCH]?: string;
      [GetCommunications.STATUS]?: number[];
      [GetCommunications.THREATS]?: number[];
      [GetCommunications.TO]?: number;
      [GetCommunications.TYPE]?: number[];
      [GetCommunications.TZ]?: number;
      [GetCommunications.USERS]?: string[];
    } | null
  ) => Promise<ServerResponse>;

  constructor(sdk: XQSDK) {
    super(sdk);
    this.serviceName = GetCommunications.COMMUNICATIONS;
    this.requiredFields = [];

    this.supplyAsync = (maybePayload) => {
      try {
        const dashboardAccessToken = this.sdk.validateAccessToken(
          Destination.DASHBOARD
        );

        const additionalHeaderProperties = {
          Authorization: "Bearer " + dashboardAccessToken,
        };

        return this.sdk
          .call(
            this.sdk.DASHBOARD_SERVER_URL,
            this.serviceName,
            CallMethod.GET,
            additionalHeaderProperties,
            maybePayload,
            true,
            Destination.DASHBOARD
          )
          .then(async (response: ServerResponse) => {
            switch (response.status) {
              case ServerResponse.OK: {
                const communications = response.payload.communications;
                return new ServerResponse(ServerResponse.OK, 200, {
                  communications,
                });
              }
              case ServerResponse.ERROR: {
                console.error(
                  `GetCommunications failed, code: ${response.statusCode}, reason: ${response.payload}`
                );
                return response;
              }
            }
          });
      } catch (exception) {
        return new Promise((resolve) => {
          resolve(
            new ServerResponse(
              ServerResponse.ERROR,
              exception.code,
              exception.reason
            )
          );
        });
      }
    };
  }
}
