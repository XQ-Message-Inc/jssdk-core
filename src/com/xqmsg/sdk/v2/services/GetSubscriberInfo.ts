import CallMethod from "../CallMethod";
import ServerResponse from "../ServerResponse";
import XQModule from "./XQModule";
import XQSDK from "../XQSDK";
import { XQServices } from "../XQServicesEnum";

import handleException from "../exceptions/handleException";

/**
 * A service which is utilized to retrieve the current subscriber's information.
 *
 * @class [GetSubscriberInfo]
 */
export default class GetSubscriberInfo extends XQModule {
  /** The required fields of the payload needed to utilize the service */
  requiredFields: string[];

  /** Specified name of the service */
  serviceName: string;

  /** The field name representing the datetime (in milliseconds) when the subscription will end */
  static ENDS: "ends" = "ends";

  /** The field name representing the last name of the user */
  static FIRST_NAME: "firstName" = "firstName";

  /** The field name representing the id of the user*/
  static ID: "id" = "id";

  /** The field name representing the last name of the user */
  static LAST_NAME: "lastName" = "lastName";

  /** The field name representing the datetime (in milliseconds) when the subscription was activated */
  static STARTS: "starts" = "starts";

  /** The field name representing the subscription status of the user */
  static SUBSCRIPTION_STATUS: "sub" = "sub";

  /** The field name representing the user */
  static USER: "user" = "user";

  /**
   * @param {Map} [maybePayload=null]
   * @returns {Promise<ServerResponse<{payload:{id:long, usr:string, firstName:string, sub:string, starts:long, ends:Long}}>>}
   */
  supplyAsync: (maybePayload: null) => Promise<ServerResponse>;

  constructor(sdk: XQSDK) {
    super(sdk);

    this.serviceName = "subscriber";
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
            this.sdk.SUBSCRIPTION_SERVER_URL,
            this.serviceName,
            CallMethod.GET,
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
                return handleException(response, XQServices.GetSubscriberInfo);
              }
            }
          });
      } catch (exception) {
        return new Promise((resolve) =>
          resolve(handleException(exception, XQServices.GetSubscriberInfo))
        );
      }
    };
  }
}
