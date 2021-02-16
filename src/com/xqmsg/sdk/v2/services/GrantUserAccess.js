import XQModule from "./XQModule.js";
import CallMethod from "./../CallMethod.js";
import ServerResponse from "../ServerResponse.js";

/**
 * This services grants access for a particular user to a specified key. The
 * person granting access must be the one who owns the key.
 */
export default class GrantUserAccess extends XQModule {

  constructor(sdk) {
    super(sdk);

    this.serviceName = "grant";
    this.requiredFields = [this.LOCATOR_TOKEN, this.RECIPIENTS];

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
      let self = this;
      self.sdk.validateInput(maybePayLoad, self.requiredFields);
      let accessToken = self.sdk.validateAccessToken();

      let recipientList = maybePayLoad[self.RECIPIENTS];
      maybePayLoad[self.RECIPIENTS]= recipientList.join(",");

      let additionalHeaderProperties = {"Authorization": "Bearer " + accessToken};

      return self.sdk.call(self.sdk.VALIDATION_SERVER_URL,
          self.serviceName + '/' + encodeURIComponent(maybePayLoad[self.LOCATOR_TOKEN]),
          CallMethod.prototype.OPTIONS,
          additionalHeaderProperties,
          maybePayLoad,
          true);
    }
    catch (exception){
      return new Promise(function (resolve, reject) {
        resolve(new ServerResponse(
            ServerResponse.prototype.ERROR,
            exception.code,
            exception.reason
        ));
      });
    }

  }



}


GrantUserAccess.prototype.RECIPIENTS = "recipients";
GrantUserAccess.prototype.LOCATOR_TOKEN = "locatorToken";
