import CallMethod from "../CallMethod";
import ServerResponse from "../ServerResponse";
import XQModule, { SupplyAsync } from "./XQModule";
import XQSDK from "../XQSDK";

/**
 * Uploads an expanded version of the encryption key as well a metadata about it to the subscription server and returns a packet<br>
 * Examples of metadata are: recipients or key expiration time
 * @class [GeneratePacket]
 */

export default class GeneratePacket extends XQModule {
  requiredFields: string[];
  serviceName: string;
  static DELETE_ON_RECEIPT: string;
  static EXPIRES_HOURS: string;
  static KEY: string;
  static RECIPIENTS: string;
  static TYPE: string;
  supplyAsync: SupplyAsync;

  constructor(sdk: XQSDK) {
    super(sdk);

    this.serviceName = "packet";
    this.requiredFields = [
      GeneratePacket.KEY,
      GeneratePacket.RECIPIENTS,
      GeneratePacket.EXPIRES_HOURS,
    ];
    /**
     * @param {Map} maybePayLoad - Container for the request parameters supplied to this method.
     * @param {String} maybePayLoad.key - The secret key that the user wants to protect.
     * @param {Long} maybePayLoad.expires - The number of hours that this key will remain valid for. After this time, it will no longer be accessible.
     * @param {[String]} maybePayLoad.recipients  -  list of emails of those recipients who are allowed to access the key.
     * @param {Boolean} [maybePayLoad.dor=false] - Should the content be deleted after opening.
     *
     * @returns {Promise<ServerResponse<{payload:string}>>} the server response containing the packet
     */
    this.supplyAsync = (maybePayLoad) => {
      try {
        this.sdk.validateInput(maybePayLoad, this.requiredFields);
        let accessToken = this.sdk.validateAccessToken();

        let additionalHeaderProperties = {
          Authorization: "Bearer " + accessToken,
        };

        maybePayLoad[GeneratePacket.RECIPIENTS] =
          maybePayLoad[GeneratePacket.RECIPIENTS].join(",");

        return this.sdk.call(
          this.sdk.SUBSCRIPTION_SERVER_URL,
          this.serviceName,
          CallMethod.POST,
          additionalHeaderProperties,
          maybePayLoad,
          true
        );
      } catch (validationException) {
        return new Promise((resolve, reject) => {
          resolve(
            new ServerResponse(
              ServerResponse.ERROR,
              validationException.code,
              validationException.reason
            )
          );
        });
      }
    };
  }
}

GeneratePacket.KEY = "key";
GeneratePacket.RECIPIENTS = "recipients";
GeneratePacket.EXPIRES_HOURS = "expires";
GeneratePacket.DELETE_ON_RECEIPT = "dor";
GeneratePacket.TYPE = "type";
