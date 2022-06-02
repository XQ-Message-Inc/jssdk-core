import CallMethod from "../../CallMethod";
import Destination from "../../Destination";
import ServerResponse from "../../ServerResponse";
import XQModule from "../XQModule";
import XQSDK from "../../XQSDK";
import { XQServices } from "../../XQServicesEnum";

import handleException from "../../exceptions/handleException";

/**
 * A service which is utilized to return all event types
 *
 * @class [GetEventLogs]
 */
export default class GetEventLogs extends XQModule {
  /** The required fields of the payload needed to utilize the service */
  requiredFields: string[];

  /** Specified name of the service */
  serviceName: string;

  /** The service name */
  static LOG: "log" = "log";

  /** The regex data to filter against */
  static DATA: "data" = "data";

  /** The regex action prefix to search for */
  static ACTION: "action" = "action";

  /** An array of threat levels to filter by */
  static THREAT: "threat" = "threat";

  /** The date range floor (in ms) */
  static FROM: "from" = "from";

  /** The date range ceiling (in ms) */
  static TO: "to" = "to";

  /** The max number of logs to return */
  static LIMIT: "limit" = "limit";

  /** The 0-based index page offset */
  static PAGE: "page" = "page";

  /** An array of user ID's to filter against */
  static USER: "user" = "user";

  /** The API key ID to use if available */
  static KEY_ID: "keyid" = "keyid";

  /** The application ID to search for */
  static APP_ID: "appid" = "appid";

  /** Specifies whether the data value should be treated as regex or not */
  static REGEX: "regex" = "regex";

  /** Specifies whether to run this query against the entire db or not */
  static FULL: "full" = "full";

  /**
   * @param {Map} maybePayLoad - Container for the request parameters supplied to this method.
   * @returns {Promise<ServerResponse<{payload: EventLogItem[] }>>}
   */
  supplyAsync: (
    maybePayload: {
      [GetEventLogs.ACTION]?: string;
      [GetEventLogs.APP_ID]?: number;
      [GetEventLogs.DATA]?: string;
      [GetEventLogs.FROM]?: number;
      [GetEventLogs.FULL]?: boolean;
      [GetEventLogs.KEY_ID]?: number;
      [GetEventLogs.LIMIT]?: number;
      [GetEventLogs.PAGE]?: number;
      [GetEventLogs.REGEX]?: boolean;
      [GetEventLogs.THREAT]?: number[];
      [GetEventLogs.TO]?: number;
      [GetEventLogs.USER]?: number[];
    } | null
  ) => Promise<ServerResponse>;

  constructor(sdk: XQSDK) {
    super(sdk);
    this.serviceName = GetEventLogs.LOG;
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
                return response;
              }
              case ServerResponse.ERROR: {
                return handleException(response, XQServices.GetEventLogs);
              }
            }
          });
      } catch (exception) {
        return new Promise((resolve) =>
          resolve(handleException(exception, XQServices.GetEventLogs))
        );
      }
    };
  }
}
