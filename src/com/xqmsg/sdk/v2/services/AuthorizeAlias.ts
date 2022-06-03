import CallMethod from "../CallMethod";
import ServerResponse from "../ServerResponse";
import XQModule from "./XQModule";
import XQSDK from "../XQSDK";
import { XQServices } from "../XQServicesEnum";

import handleException from "../exceptions/handleException";

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

  /** The field name representing the user's email or phone number */
  static USER: "user" = "user";

  /**
   * @param {Map} maybePayload - the container for the request parameters supplied to this method.
   * @param {String} maybePayload.user - Email of the user to be validated.
   * @param {String} [maybePayload.firstName] - First name of the user. (Optional)
   * @param {String} [maybePayload.lastName] - Last name of the user. (Optional)
   *
   * @returns {Promise<ServerResponse<{payload:string}>>}
   */
  supplyAsync: (maybePayload: IAuthorizeAliasParams) => Promise<ServerResponse>;

  constructor(sdk: XQSDK) {
    super(sdk);

    this.serviceName = "authorizealias";
    this.requiredFields = [AuthorizeAlias.USER];

    this.supplyAsync = (maybePayload) => {
      try {
        this.sdk.validateInput(maybePayload, this.requiredFields);

        const self = this;

        const aliasUser =
          maybePayload[AuthorizeAlias.USER as keyof IAuthorizeAliasParams] ??
          "";

        return this.sdk
          .call(
            this.sdk.SUBSCRIPTION_SERVER_URL,
            this.serviceName,
            CallMethod.POST,
            null,
            maybePayload,
            true
          )
          .then((response: ServerResponse) => {
            switch (response.status) {
              case ServerResponse.OK: {
                const accessToken = response.payload;

                self.cache.putXQAccess(aliasUser, accessToken);
                self.cache.putActiveProfile(aliasUser);

                return response;
              }
              case ServerResponse.ERROR: {
                return handleException(response, XQServices.AuthorizeAlias);
              }
            }
          });
      } catch (exception) {
        return handleException(exception, XQServices.AuthorizeAlias);
      }
    };
  }
}
