import CallMethod from "../CallMethod";
import ServerResponse from "../ServerResponse";
import XQModule, { SupplyAsync } from "./XQModule";
import XQSDK from "../XQSDK";

/**
 *  Validates the packet that is returned from {@link GeneratePacket}.<br>
 *  Returns the key locator token<.br>
 *  @class [ValidatePacket]
 */
export default class ValidatePacket extends XQModule {
  serviceName: string;
  requiredFields: any[];
  static PACKET: any;
  supplyAsync: SupplyAsync;

  constructor(sdk: XQSDK) {
    super(sdk);

    this.serviceName = "packet";
    this.requiredFields = [ValidatePacket.PACKET];

    /**
     *
     * @param {{}} maybePayLoad:
     * @returns {Promise<ServerResponse<{payload:String}>>} the server response containing the key locator token
     */
    this.supplyAsync = (maybePayLoad) => {
      try {
        this.sdk.validateInput(maybePayLoad, this.requiredFields);
        let accessToken = this.sdk.validateAccessToken();

        let additionalHeaderProperties = {
          Authorization: "Bearer " + accessToken,
          [XQSDK.CONTENT_TYPE]: XQSDK.TEXT_PLAIN_UTF_8,
        };

        return this.sdk.call(
          this.sdk.VALIDATION_SERVER_URL,
          this.serviceName,
          CallMethod.POST,
          additionalHeaderProperties,
          maybePayLoad,
          true
        );
      } catch (validationException) {
        return new Promise((resolve, reject) => {
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

ValidatePacket.PACKET = "data";
