import CallMethod from "../CallMethod";
import ServerResponse from "../ServerResponse";
import XQModule, { SupplyAsync } from "./XQModule";
import XQSDK from "../XQSDK";

/**
 * This services adds new users to XQ system.
 * It is a variant of {@link Authorize} which adds the user without validating a given email via PIN.
 * However, its use is limited to basic encryption and decryption.
 * @class [AuthorizeAlias]
 */
export default class AuthorizeAlias extends XQModule {
  requiredFields: string[];
  serviceName: string;
  static FIRST_NAME: string;
  static LAST_NAME: string;
  static USER: string;
  supplyAsync: SupplyAsync;

  constructor(sdk: XQSDK) {
    super(sdk);

    this.serviceName = "authorizealias";
    this.requiredFields = [AuthorizeAlias.USER];

    /**
     * @param {Map} maybePayLoad - Container for the request parameters supplied to this method.
     * @param {String} maybePayLoad.user - Email of the user to be validated.
     * @param {String} [maybePayLoad.firstName] - First name of the user.
     * @param {String} [maybePayLoad.lastName] - Last name of the user.
     *
     * @returns {Promise<ServerResponse<{payload:string}>>}
     */
    this.supplyAsync = (maybePayLoad) => {
      try {
        let self = this;

        this.sdk.validateInput(maybePayLoad, this.requiredFields);

        const aliasUser = maybePayLoad[AuthorizeAlias.USER];

        return this.sdk
          .call(
            this.sdk.SUBSCRIPTION_SERVER_URL,
            this.serviceName,
            CallMethod.POST,
            null,
            maybePayLoad,
            true
          )
          .then((authorizeAliasResponse: ServerResponse) => {
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
                return console.error("Error retrieving alias authorization");
              }
            }
          });
      } catch (validationException) {
        return new Promise((resolve) => {
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

AuthorizeAlias.USER = "user";
AuthorizeAlias.FIRST_NAME = "firstName";
AuthorizeAlias.LAST_NAME = "lastName";
