import XQModule from "./XQModule.js";
import CallMethod from "./../CallMethod.js";
import ServerResponse from "../ServerResponse.js";

/**
 *
 * Get User Information.
 *
 * @class [GetUserInfo]
 */
export default class GetUserInfo extends XQModule {
  constructor(sdk) {
    super(sdk);

    this.serviceName = "subscriber";
    this.requiredFields = [];
  }

  /**
   * @param {Map} [maybePayLoad=null]
   * @returns {Promise<ServerResponse<{payload:{id:long, usr:string, firstName:string, sub:string, starts:long, ends:Long}}>>}
   */
  supplyAsync = function (maybePayLoad) {
    try {
      let accessToken = this.sdk.validateAccessToken();

      let additionalHeaderProperties = {
        Authorization: "Bearer " + accessToken,
      };

      return this.sdk.call(
        this.sdk.SUBSCRIPTION_SERVER_URL,
        this.serviceName,
        CallMethod.GET,
        additionalHeaderProperties,
        maybePayLoad,
        true
      );
    } catch (exception) {
      return new Promise(function (resolve, reject) {
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

GetUserInfo.ID = "id";
GetUserInfo.FIRST_NAME = "firstName";
GetUserInfo.LAST_NAME = "lastName";
/** The user's email asddress.*/
GetUserInfo.USER = "user";
GetUserInfo.SUBSCRIPTION_STATUS = "sub";
/**The datetime (in milliseconds) when the subscription was activated.*/
GetUserInfo.STARTS = "starts";
/**The datetime (in milliseconds) when the subscription will end*/
GetUserInfo.ENDS = "ends";
