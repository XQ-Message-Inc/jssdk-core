import XQModule from "../XQModule";
import CallMethod from "../../CallMethod";
import Destination from "../../Destination";
import ServerResponse from "../../ServerResponse";
import XQSDK from "../../XQSDK";

/**
 *
 *  Disable a Contact
 *
 * @class [DisableContact]
 */
export default class DisableContact extends XQModule {
  /** The required fields of the payload needed to utilize the service */
  requiredFields: string[];

  /** Specified name of the service */
  serviceName: string;
  static ID: string;
  supplyAsync: (maybePayLoad: Record<string, any>) => ServerResponse;

  constructor(sdk: XQSDK) {
    super(sdk);
    this.serviceName = "contact";
    this.requiredFields = [DisableContact.ID];

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
          `${this.serviceName}/${maybePayLoad[DisableContact.ID]}`,
          CallMethod.DELETE,
          additionalHeaderProperties,
          null,
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

DisableContact.ID = "id";
