import CallMethod from "../CallMethod";
import ServerResponse from "../ServerResponse";
import XQModule from "./XQModule";
import XQSDK from "../XQSDK";

/**
 *  A service which is utilized to validate a {@link Authorize} service call
 *  Returns 204, "No Content" if successful.
 *  @class [ValidatePacket]
 */
export default class ValidatePacket extends XQModule {
  /** The required fields of the payload needed to utilize the service */
  requiredFields: string[];

  /** Specified name of the service */
  serviceName: string;

  /** The field name representing the packet data */
  static PACKET: "data";

  /**
   *
   * @param {{}} maybePayLoad:
   * @returns {Promise<ServerResponse<{}>>}
   */
  supplyAsync: (maybePayload: {
    data: Record<string, unknown>;
  }) => Promise<ServerResponse>;

  constructor(sdk: XQSDK) {
    super(sdk);

    this.serviceName = "packet";
    this.requiredFields = [ValidatePacket.PACKET];

    this.supplyAsync = (maybePayLoad) => {
      try {
        this.sdk.validateInput(maybePayLoad, this.requiredFields);
        const accessToken = this.sdk.validateAccessToken();

        const additionalHeaderProperties = {
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
