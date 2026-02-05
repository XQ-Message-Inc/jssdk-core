import CallMethod from "../../CallMethod";
import ServerResponse from "../../ServerResponse";
import XQModule from "../XQModule";
import XQSDK from "../../XQSDK";
import { XQServices } from "../../XQServicesEnum";

import handleException from "../../exceptions/handleException";

/**
 * A service which is utilized to create a new Contact (team member)
 *
 * Delta API: POST /v3/team/member
 * @class [AddContact]
 */
export default class AddContact extends XQModule {
  /** The required fields of the payload needed to utilize the service */
  requiredFields: string[];

  /** Specified name of the service */
  serviceName: string;

  /** The field name representing the new contact's email */
  static EMAIL: "email" = "email";

  /** The field name representing the new contact's first name */
  static FIRST_NAME: "firstName" = "firstName";

  /** The field name representing the new contact's ID */
  static ID: "id" = "id";

  /** The field name representing the new contact's last name */
  static LAST_NAME: "lastName" = "lastName";

  /** The field name representing the notifications preferences for the new contact */
  static NOTIFICATIONS: "notifications" = "notifications";

  /** The field name representing the new contact's role */
  static ROLE: "role" = "role";

  /** The field name representing the new contact's title */
  static TITLE: "title" = "title";

  /**
   * @param {Map} maybePayload - the container for the request parameters supplied to this method.
   * @param {String} email - the email of the new Contact
   * @param {String} role - the role of the new Contact
   * @param {String} notifications - the notifications preference of the current user for the new Contact
   * @returns {Promise<ServerResponse<{payload:{id:int, status:string}}>>}
   */
  supplyAsync: (maybePayload: {
    email: string;
    role: string;
    notifications: boolean;
  }) => Promise<ServerResponse>;

  constructor(sdk: XQSDK) {
    super(sdk);
    this.serviceName = "team/member";
    this.requiredFields = [
      AddContact.EMAIL,
      AddContact.ROLE,
      AddContact.NOTIFICATIONS,
    ];

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
            CallMethod.POST,
            additionalHeaderProperties,
            maybePayload,
            true
          )
          .then((response: ServerResponse) => {
            switch (response.status) {
              case ServerResponse.OK: {
                return response;
              }
              case ServerResponse.ERROR: {
                return handleException(response, XQServices.AddContact);
              }
            }
          });
      } catch (exception) {
        return new Promise((resolve) =>
          resolve(handleException(exception, XQServices.AddContact))
        );
      }
    };
  }
}
