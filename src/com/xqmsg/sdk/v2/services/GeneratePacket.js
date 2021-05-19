import XQModule from "./XQModule.js";
import CallMethod from "./../CallMethod.js";
import ServerResponse from "../ServerResponse.js";

/**
 * @class [GeneratePacket]
 */

export default class GeneratePacket extends XQModule {
  constructor(sdk) {
    super(sdk);

    this.serviceName = "packet";
    this.requiredFields = [
      GeneratePacket.KEY,
      GeneratePacket.RECIPIENTS,
      GeneratePacket.EXPIRES_HOURS,
    ];
  }

  /**
   * @param {Map} maybePayLoad - Container for the request parameters supplied to this method.
   * @param {String} maybePayLoad.key - The secret key that the user wants to protect.
   * @param {Long} maybePayLoad.expires - The number of hours that this key will remain valid for. After this time, it will no longer be accessible.
   * @param {[String]} maybePayLoad.recipients  -  list of emails of those recipients who are allowed to access the key.
   * @param {Boolean} [maybePayLoad.dor=false] - Should the content be deleted after opening.
   *
   * @returns {Promise<ServerResponse<{payload:string}>>}
   */
  supplyAsync = function (maybePayLoad) {
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
      return new Promise(function (resolve, reject) {
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

GeneratePacket.KEY = "key";
GeneratePacket.RECIPIENTS = "recipients";
GeneratePacket.EXPIRES_HOURS = "expires";
GeneratePacket.DELETE_ON_RECEIPT = "dor";
GeneratePacket.TYPE = "type";
