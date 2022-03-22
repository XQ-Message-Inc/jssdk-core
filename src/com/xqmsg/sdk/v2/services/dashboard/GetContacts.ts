import CallMethod from "../../CallMethod";
import Destination from "../../Destination";
import ServerResponse from "../../ServerResponse";
import { UserRole } from "../../types/dashboard";
import XQModule from "../XQModule";
import XQSDK from "../../XQSDK";

/**
 * A service which is utilized to return all contacts of the current user
 *
 * @class [GetContacts]
 */
export default class GetContacts extends XQModule {
  /** The required fields of the payload needed to utilize the service */
  requiredFields: string[];

  /** Specified name of the service */
  serviceName: string;

  /** The service name */
  static CONTACT: "contact" = "contact";

  /** The field name representing the filter for the list of Contacts */
  static FILTER: "filter" = "filter";

  /** The field name representing the id */
  static ID: "id" = "id";

  /** The field name representing the limit of the list of Contacts */
  static LIMIT: "limit" = "limit";

  /** The field name representing the page of the list of Contacts */
  static PAGE: "page" = "page";

  /** The field name representing the role */
  static ROLE: "role" = "role";

  /**
   * @param {Map} maybePayLoad - Container for the request parameters supplied to this method.
   * @returns {Promise<ServerResponse<{payload: ContactSummary }>>}
   */
  supplyAsync: (
    maybePayload: {
      [GetContacts.FILTER]?: string;
      [GetContacts.ID]?: string;
      [GetContacts.LIMIT]?: number;
      [GetContacts.PAGE]?: number;
      [GetContacts.ROLE]?: UserRole;
    } | null
  ) => Promise<ServerResponse>;

  constructor(sdk: XQSDK) {
    super(sdk);
    this.serviceName = GetContacts.CONTACT;
    this.requiredFields = [];

    // TODO(worstestes - 3.21.22): add filter capabilities
    this.supplyAsync = () => {
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
            this.serviceName + "/all",
            CallMethod.GET,
            additionalHeaderProperties,
            null,
            true,
            Destination.DASHBOARD
          )
          .then(async (response: ServerResponse) => {
            switch (response.status) {
              case ServerResponse.OK: {
                const contacts = response.payload.contacts;
                return new ServerResponse(ServerResponse.OK, 200, { contacts });
              }
              case ServerResponse.ERROR: {
                console.error(
                  `GetContacts failed, code: ${response.statusCode}, reason: ${response.payload}`
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
