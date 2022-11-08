import CallMethod from "../../CallMethod";
import Destination from "../../Destination";
import ServerResponse from "../../ServerResponse";
import XQModule from "../XQModule";
import XQSDK from "../../XQSDK";

/**
 * A service which is utilized to find a given dashboard's Contacts
 *
 * @class [FindContacts]
 */
export default class FindContacts extends XQModule {
  /** The required fields of the payload needed to utilize the service */
  requiredFields: string[];

  /** Specified name of the service */
  serviceName: string;

  /** The field name representing the Contacts */
  static CONTACTS: "contacts" = "contacts";

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
   * @returns {Promise<ServerResponse<{payload:{groups:[{id:int, name:string, bid:int}]}}>>}
   */
  supplyAsync: (maybePayload: null) => Promise<ServerResponse>;

  constructor(sdk: XQSDK) {
    super(sdk);
    this.serviceName = "contact";
    this.requiredFields = [];

    this.supplyAsync = (maybePayLoad) => {
      try {
        const dashboardAccessToken = this.sdk.validateAccessToken(
          Destination.DASHBOARD
        );

        const additionalHeaderProperties = {
          Authorization: "Bearer " + dashboardAccessToken,
        };

        return this.sdk.call(
          this.sdk.DASHBOARD_SERVER_URL,
          this.serviceName,
          CallMethod.GET,
          additionalHeaderProperties,
          maybePayLoad,
          true,
          Destination.DASHBOARD
        );
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
