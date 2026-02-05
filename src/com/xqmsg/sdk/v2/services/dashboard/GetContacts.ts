import CallMethod from "../../CallMethod";
import ServerResponse from "../../ServerResponse";
import { UserRole } from "../../types/dashboard";
import XQModule from "../XQModule";
import XQSDK from "../../XQSDK";
import { XQServices } from "../../XQServicesEnum";

import handleException from "../../exceptions/handleException";

/**
 * A service which is utilized to return all contacts (team members) of the current user
 *
 * Delta API: GET /v3/team/members
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
   * @param {Map} maybePayload - the container for the request parameters supplied to this method.
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
    this.serviceName = "team/members";
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
            true
          )
          .then(async (response: ServerResponse) => {
            switch (response.status) {
              case ServerResponse.OK: {
                return response;
              }
              case ServerResponse.ERROR: {
                return handleException(response, XQServices.GetContacts);
              }
            }
          });
      } catch (exception) {
        return new Promise((resolve) =>
          resolve(handleException(exception, XQServices.GetContacts))
        );
      }
    };
  }
}
