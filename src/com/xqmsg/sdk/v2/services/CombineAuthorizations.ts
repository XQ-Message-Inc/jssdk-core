import CallMethod from "../CallMethod";
import ServerResponse from "../ServerResponse";
import XQModule from "./XQModule";
import XQSDK from "../XQSDK";
import { XQServices } from "../XQServicesEnum";

import handleException from "../exceptions/handleException";

/**
 * A service which is utilized to merge two or more valid access tokens (along with the access
 * token used to make the call) into a single one that can be used for temporary read access.
 *
 * This is useful in situations where a user who has authenticated with multiple accounts wants
 * to get a key for a particular message without needing to know exactly which of their accounts
 * is a valid recipient. As long as one of the accounts in the merged token have access,
 * they will be able to get the key.
 *
 * The merged token has three restrictions:
 * 1. It cannot be used to send messages
 * 2. It can only be created from other valid access tokens.
 * 3. It is only valid for a short amount of time.
 *
 * @class [CombineAuthorizations]
 */
export default class CombineAuthorizations extends XQModule {
  /** The required fields of the payload needed to utilize the service */
  requiredFields: string[];

  /** Specified name of the service */
  serviceName: string;

  /** The field name representing the merged token */
  static MERGED_TOKEN: "token" = "token";

  /** The field name representing the number of tokens that were successfully merged into the token */
  static MERGE_COUNT: "merged" = "merged";

  /** The field name representing the list of tokens to merge */
  static TOKENS: "tokens" = "tokens";
  /**
   * @param {Map} maybePayLoad - Container for the request parameters supplied to this method.
   * @param {[String]} maybePayLoad.tokens - The list of tokens to merge
   * @returns {Promise<ServerResponse<{payload:{token:string, merged:long}}>>}
   */
  supplyAsync: (maybePayload: { tokens: string[] }) => Promise<ServerResponse>;

  constructor(sdk: XQSDK) {
    super(sdk);

    this.serviceName = "combined";
    this.requiredFields = [CombineAuthorizations.TOKENS];

    this.supplyAsync = (maybePayLoad) => {
      try {
        this.sdk.validateInput(maybePayLoad, this.requiredFields);
        const accessToken = this.sdk.validateAccessToken();

        const additionalHeaderProperties = {
          Authorization: "Bearer " + accessToken,
        };
        return this.sdk
          .call(
            this.sdk.SUBSCRIPTION_SERVER_URL,
            this.serviceName,
            CallMethod.POST,
            additionalHeaderProperties,
            maybePayLoad,
            true
          )
          .then((response: ServerResponse) => {
            switch (response.status) {
              case ServerResponse.OK: {
                return response;
              }
              case ServerResponse.ERROR: {
                return handleException(
                  response,
                  XQServices.CombineAuthorizations
                );
              }
            }
          });
      } catch (exception) {
        return new Promise((resolve) =>
          resolve(handleException(exception, XQServices.CombineAuthorizations))
        );
      }
    };
  }
}
