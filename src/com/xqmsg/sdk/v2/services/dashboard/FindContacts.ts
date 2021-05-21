import XQModule, { SupplyAsync } from "../XQModule";
import CallMethod from "../../CallMethod";
import Destination from "../../Destination";
import ServerResponse from "../../ServerResponse";
import XQSDK from "../../XQSDK";

/**
 *
 *  Find a dashboard Contacts
 *
 * @class [FindContacts]
 */
export default class FindContacts extends XQModule {
  requiredFields: string[];
  serviceName: string;
  static CONTACTS: string;
  static FILTER: string;
  static ID: string;
  static LIMIT: string;
  static PAGE: string;
  static ROLE: string;
  supplyAsync: SupplyAsync;

  constructor(sdk: XQSDK) {
    super(sdk);
    this.serviceName = "contact";
    this.requiredFields = [];

    /**
     * @param {Map} maybePayLoad - Container for the request parameters supplied to this method.
     * @returns {Promise<ServerResponse<{payload:{groups:[{id:int, name:string, bid:int}]}}>>}
     */
    this.supplyAsync = (maybePayLoad) => {
      try {
        let dashboardAccessToken = this.sdk.validateAccessToken(
          Destination.DASHBOARD
        );

        let additionalHeaderProperties = {
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
        return new Promise((resolve, reject) => {
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

FindContacts.ID = "id";
FindContacts.CONTACTS = "contacts";
FindContacts.FILTER = "filter";
FindContacts.ROLE = "role";
FindContacts.LIMIT = "limit";
FindContacts.PAGE = "page";
