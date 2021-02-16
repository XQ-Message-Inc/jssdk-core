import XQModule from "./XQModule.js";
import CallMethod from "./../CallMethod.js";
import ServerResponse from "../ServerResponse.js";

/**
 * This endpoint is useful for merging two or more valid access tokens ( along with the access token used to make the call ) into a single one that can be used for temporary read access.
 * This is useful in situations where a user who has authenticated with multiple accounts wants to get a key for a particular message without needing to know exactly which of their accounts is a valid recipient. As long as one of the accounts in the merged token have access, they will be able to get the ke
 * The merged token has three restrictions:
 * 1. It cannot be used to send messages
 * 2. It can only be created from other valid access tokens.
 * 3. It is only valid for a short amount of time.
 */
export default class CombineAuthorizations extends XQModule{

    constructor(sdk) {
        super(sdk);

        this.serviceName =  "combined";
        this.requiredFields = [this.TOKENS];
    }


    /**
     * @param {Map} maybePayLoad - Container for the request parameters supplied to this method.
     * @param {[String]} maybePayLoad.tokens - The list of tokens to merge
     * @returns {Promise<ServerResponse<{payload:{token:string, merged:long}}>>}
     */
    supplyAsync = function (maybePayLoad) {

        try {

            const self = this;
            self.sdk.validateInput(maybePayLoad, self.requiredFields);
            let accessToken = self.sdk.validateAccessToken();

            let additionalHeaderProperties = {"Authorization": "Bearer " + accessToken};
            return self.sdk.call(self.sdk.SUBSCRIPTION_SERVER_URL,
                                 self.serviceName,
                                 CallMethod.prototype.POST,
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


CombineAuthorizations.prototype.TOKENS = "tokens";
/**The merged token.*/
CombineAuthorizations.prototype.MERGED_TOKEN = "token";
/**The number of tokens that were successfully merged into the token.*/
CombineAuthorizations.prototype.MERGE_COUNT = "merged";
