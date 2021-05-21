import CallMethod from "../CallMethod";
import ServerResponse from "../ServerResponse";
import XQModule from "./XQModule";
import XQSDK from "../XQSDK";

/**
 * Deletes the user specified by the access token.
 * After an account is deleted, the subscriber will be sent an email notifying them of its deletion.
 *
 * @class [DeleteSubscriber]
 */
export default class DeleteSubscriber extends XQModule {
  serviceName: string;
  supplyAsync: (maybePayLoad: any) => any;
  constructor(sdk: XQSDK) {
    super(sdk);

    this.serviceName = "subscriber";

    /**
     *
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
