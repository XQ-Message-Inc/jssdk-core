import XQModule from "./XQModule.js";
import CallMethod from "./../CallMethod.js";
import ServerResponse from "../ServerResponse.js";

/**
 * This services grants access for a particular user to a specified key. The
 * person granting access must be the one who owns the key.
 *
 * @class [GrantUserAccess]
 */
export default class GrantUserAccess extends XQModule {

  constructor(sdk) {
    super(sdk);

    this.serviceName = "grant";
    this.requiredFields = [GrantUserAccess.LOCATOR_TOKEN, GrantUserAccess.RECIPIENTS];

  }


  /**
   * @param {Map} maybePayLoad - Container for the request parameters supplied to this method.
   * @param {[String]} maybePayLoad.recipients  - List of emails of users intended to have read access to the encrypted content.
   * @param {String} maybePayLoad.locatorToken - A URL encoded version of the key locator token to fetch the key from the server.
   * @see #encodeURIComponent function encodeURIComponent (built-in since ES-5)
   * @returns {Promise<ServerResponse<{payload:{data:{}}}>>}

   *
   */

  supplyAsync = function (maybePayLoad) {

    try {

      this.sdk.validateInput(maybePayLoad, this.requiredFields);
      let accessToken = this.sdk.validateAccessToken();

      let recipientList = maybePayLoad[GrantUserAccess.RECIPIENTS];
      maybePayLoad[GrantUserAccess.RECIPIENTS]= recipientList.join(",");

      let additionalHeaderProperties = {"Authorization": "Bearer " + accessToken};

      return this.sdk
                 .call(this.sdk.VALIDATION_SERVER_URL,
                       this.serviceName + '/' + encodeURIComponent(maybePayLoad[GrantUserAccess.LOCATOR_TOKEN]),
                       CallMethod.OPTIONS,
                       additionalHeaderProperties,
                       maybePayLoad,
                       true);
    }
    catch (exception){
      return new Promise(function (resolve, reject) {
        resolve(new ServerResponse(
            ServerResponse.ERROR,
            exception.code,
            exception.reason
        ));
      });
    }

  }



}


GrantUserAccess.RECIPIENTS = "recipients";
GrantUserAccess.LOCATOR_TOKEN = "locatorToken";
