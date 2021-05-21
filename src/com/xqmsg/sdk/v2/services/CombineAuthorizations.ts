import CallMethod from "../CallMethod";
import ServerResponse from "../ServerResponse";
import XQModule, { SupplyAsync } from "./XQModule";
import XQSDK from "../XQSDK";

/**
 * This endpoint is useful for merging two or more valid access tokens ( along with the access token used to make the call ) into a single one that can be used for temporary read access.
 * This is useful in situations where a user who has authenticated with multiple accounts wants to get a key for a particular message without needing to know exactly which of their accounts is a valid recipient. As long as one of the accounts in the merged token have access, they will be able to get the ke
 * The merged token has three restrictions:
 * 1. It cannot be used to send messages
 * 2. It can only be created from other valid access tokens.
 * 3. It is only valid for a short amount of time.
 *
 * @class [CombineAuthorizations]
 */
export default class CombineAuthorizations extends XQModule {
  requiredFields: string[];
  serviceName: string;
  static MERGED_TOKEN: string;
  static MERGE_COUNT: string;
  static TOKENS: string;
  supplyAsync: SupplyAsync;

  constructor(sdk: XQSDK) {
    super(sdk);

    this.serviceName = "combined";
    this.requiredFields = [CombineAuthorizations.TOKENS];

    /**
     * @param {Map} maybePayLoad - Container for the request parameters supplied to this method.
     * @param {[String]} maybePayLoad.tokens - The list of tokens to merge
     * @returns {Promise<ServerResponse<{payload:{token:string, merged:long}}>>}
     */
    this.supplyAsync = (maybePayLoad) => {
      try {
        this.sdk.validateInput(maybePayLoad, this.requiredFields);
        let accessToken = this.sdk.validateAccessToken();

        let additionalHeaderProperties = {
          Authorization: "Bearer " + accessToken,
        };
        return this.sdk.call(
          this.sdk.SUBSCRIPTION_SERVER_URL,
          this.serviceName,
          CallMethod.POST,
          additionalHeaderProperties,
          maybePayLoad,
          true
        );
      } catch (exception) {
        return new Promise((resolve, reject) => {
          resolve(
            new ServerResponse(
              ServerResponse.ERROR,
              exception.code,
              exception.reason
            )
          );
        });
      }
    };
  }
}

CombineAuthorizations.TOKENS = "tokens";
/**The merged token.*/
CombineAuthorizations.MERGED_TOKEN = "token";
/**The number of tokens that were successfully merged into the token.*/
CombineAuthorizations.MERGE_COUNT = "merged";
