import CallMethod from "../CallMethod";
import ServerResponse from "../ServerResponse";
import XQModule from "./XQModule";
import XQSDK from "../XQSDK";

interface IAuthorizeAliasParams {
  user: string;
  firstName?: string;
  lastName?: string;
}
/**
 * A service which is utilized to add new users to XQ system.
 * It is a variant of `Authorize` which adds the user without validating a given email via PIN.
 * However, its use is limited to basic encryption and decryption.
 * @class [AuthorizeAlias]
 */
export default class AuthorizeAlias extends XQModule {
  /** The required fields of the payload needed to utilize the service */
  requiredFields: string[];

  /** Specified name of the service */
  serviceName: string;

  /** The field name representing the first name of the user */
  static FIRST_NAME: "firstName" = "firstName";

  /** The field name representing the last name of the user */
  static LAST_NAME: "lastName" = "lastName";

  /** The field name representing the news letter service */
  static USER: "user" = "user";

  /**
   * @param {Map} maybePayLoad - Container for the request parameters supplied to this method.
   * @param {String} maybePayLoad.user - Email of the user to be validated.
   * @param {String} [maybePayLoad.firstName] - First name of the user. (Optional)
   * @param {String} [maybePayLoad.lastName] - Last name of the user. (Optional)
   *
   * @returns {Promise<ServerResponse<{payload:string}>>}
   */
  supplyAsync: (maybePayload: IAuthorizeAliasParams) => Promise<ServerResponse>;

  constructor(sdk: XQSDK) {
    super(sdk);

    this.serviceName = "authorizealias";
    this.requiredFields = [AuthorizeAlias.USER];

    this.supplyAsync = (maybePayLoad) => {
      try {
        const self = this;

        this.sdk.validateInput(maybePayLoad, this.requiredFields);

        const aliasUser =
          maybePayLoad[AuthorizeAlias.USER as keyof IAuthorizeAliasParams] ??
          "";

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
                const accessToken = authorizeAliasResponse.payload;
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
