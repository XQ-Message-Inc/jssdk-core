import CallMethod from "../CallMethod";
import ServerResponse from "../ServerResponse";
import XQModule, { SupplyAsync } from "./XQModule";
import XQSDK from "../XQSDK";

/**
 * Revokes a key using its token. <br>
 * Only the user who sent the message will be able to revoke it.
 *
 * @class [DeleteAuthorization]
 */
export default class DeleteAuthorization extends XQModule {
  serviceName: string;
  supplyAsync: SupplyAsync;

  constructor(sdk: XQSDK) {
    super(sdk);
    this.serviceName = "authorization";

    /**
     *
     * @method supplyAsync
     * @param {{}} [maybePayLoad=null]
     * @returns {Promise<ServerResponse<{}>>}
     */
    this.supplyAsync = (maybePayLoad) => {
      try {
        let accessToken = this.sdk.validateAccessToken();

        let additionalHeaderProperties = {
          Authorization: "Bearer " + accessToken,
        };

        return this.sdk.call(
          this.sdk.SUBSCRIPTION_SERVER_URL,
          this.serviceName,
          CallMethod.DELETE,
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
