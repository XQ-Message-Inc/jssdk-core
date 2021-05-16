import XQModule from "./XQModule.js";
import CallMethod from "./../CallMethod.js";
import ServerResponse from "../ServerResponse.js";

/**
 * This services adds new users to XQ system.
 * It is a variant of {@link Authorize} which adds the user without validating a given email via PIN.
 * However, its use is limited to basic encryption and decryption.
 * @class [AuthorizeAlias]
 */
export default class AuthorizeAlias extends XQModule{

  constructor(sdk) {
    super(sdk);

    this.serviceName = "authorizealias";
    this.requiredFields = [AuthorizeAlias.USER];
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

      let self = this;

      this.sdk.validateInput(maybePayLoad, this.requiredFields);

      const aliasUser = maybePayLoad[AuthorizeAlias.USER];

      return this.sdk
                 .call(this.sdk.SUBSCRIPTION_SERVER_URL,
                       this.serviceName,
                       CallMethod.POST,
                       null,
                       maybePayLoad,
                       true)
                .then(function (authorizeAliasResponse){
                  switch (authorizeAliasResponse.status) {
                    case ServerResponse.OK: {
                      let accessToken = authorizeAliasResponse.payload;
                      try {
                        self.cache.putXQAccess(aliasUser, accessToken);
                        return authorizeAliasResponse;
                      } catch (e) {
                        console.log(e.message);
                        return null;
                      }
                    }
                    default: {
                      return exchangeResponse;
                    }
                  }
                      });
    }
    catch (validationException){
      return new Promise(function (resolve) {
        resolve(new ServerResponse(
            ServerResponse.ERROR,
            validationException.code,
            validationException.reason
        ));
      });
    }


  }
}

AuthorizeAlias.USER = "user";
AuthorizeAlias.FIRST_NAME = "firstName";
AuthorizeAlias.LAST_NAME = "lastName";