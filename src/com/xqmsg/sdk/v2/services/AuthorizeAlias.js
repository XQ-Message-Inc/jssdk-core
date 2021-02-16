import XQModule from "./XQModule.js";
import CallMethod from "./../CallMethod.js";
import ServerResponse from "../ServerResponse.js";

/**
 * This services adds new users to XQ system.
 * It is a variant of {@link Authorize} which adds the user without validating a given email via PIN.
 * However, its use is limited to basic encryption and decryption.
 */
export default class AuthorizeAlias extends XQModule{

  constructor(sdk) {
    super(sdk);

    this.serviceName = "authorizealias";
    this.requiredFields = [this.USER];
  }


  /**
   * @param {Map} maybePayLoad - Container for the request parameters supplied to this method.
   * @param {String} maybePayLoad.user - Email of the user to be validated.
   * @param {String} [maybePayLoad.firstName] - First name of the user.
   * @param {String} [maybePayLoad.lastName] - Last name of the user.
   *
   * @returns {Promise<ServerResponse<{payload:string}>>}
   */
  supplyAsync = function (maybePayLoad) {

    try {

      const self = this;
      self.sdk.validateInput(maybePayLoad, self.requiredFields);

      return self.sdk.call(self.sdk.SUBSCRIPTION_SERVER_URL,
                           self.serviceName,
                           CallMethod.prototype.POST,
                           null,
                           maybePayLoad,
                           true)
    }
    catch (validationException){
      return new Promise(function (resolve, reject) {
        resolve(new ServerResponse(
            ServerResponse.prototype.ERROR,
            validationException.code,
            validationException.reason
        ));
      });
    }


  }
}

AuthorizeAlias.prototype.USER = "user";
AuthorizeAlias.prototype.FIRST_NAME = "firstName";
AuthorizeAlias.prototype.LAST_NAME = "lastName";

