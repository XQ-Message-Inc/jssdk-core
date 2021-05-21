import XQModule from "../XQModule";
import CallMethod from "../../CallMethod";
import Destination from "../../Destination";
import ServerResponse from "../../ServerResponse";
import XQSDK from "../../XQSDK";

/**
 *
 *  Create a new Contact
 *
 * @class [AddContact]
 */
export default class AddContact extends XQModule {
  requiredFields: string[];
  serviceName: string;
  static EMAIL: string;
  static FIRST_NAME: string;
  static ID: string;
  static LAST_NAME: string;
  static NOTIFICATIONS: string;
  static ROLE: string;
  static TITLE: string;
  supplyAsync: (maybePayLoad: Record<string, any>) => any;

  constructor(sdk: XQSDK) {
    super(sdk);
    this.serviceName = "contact";
    this.requiredFields = [
      AddContact.EMAIL,
      AddContact.ROLE,
      AddContact.NOTIFICATIONS,
    ];

    /**
     * @param {Map} maybePayLoad - Container for the request parameters supplied to this method.
     * @returns {Promise<ServerResponse<{payload:{id:int, status:string}}>>}
     */
    this.supplyAsync = (maybePayLoad) => {
      try {
        this.sdk.validateInput(maybePayLoad, this.requiredFields);

        let dashboardAccessToken = this.sdk.validateAccessToken(
          Destination.DASHBOARD
        );

        let additionalHeaderProperties = {
          Authorization: "Bearer " + dashboardAccessToken,
        };

        return this.sdk.call(
          this.sdk.DASHBOARD_SERVER_URL,
          this.serviceName,
          CallMethod.POST,
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

AddContact.ID = "id";
AddContact.EMAIL = "email";
AddContact.ROLE = "role";
AddContact.NOTIFICATIONS = "notifications";
AddContact.LAST_NAME = "lastName";
AddContact.FIRST_NAME = "firstName";
AddContact.TITLE = "title";
