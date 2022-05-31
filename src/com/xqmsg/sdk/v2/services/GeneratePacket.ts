import CallMethod from "../CallMethod";
import { CommunicationsEnum } from "../CommunicationsEnum";
import ServerResponse from "../ServerResponse";
import XQModule from "./XQModule";
import XQSDK from "../XQSDK";
import { XQServices } from "../XQServicesEnum";
import handleException from "../exceptions/handleException";

export interface IGeneratePacketParams {
  key: string;
  expires: number;
  recipients: string[];
  dor: boolean;
  type: CommunicationsEnum;
  meta: Record<string, unknown> | null;
}

/**
 * A service which is utilized to generate an encrypted packet containing the encryption key that you want to
 * protect along with a list of the identities that are allowed to access it and how long it is allowed to be used.
 * @class [GeneratePacket]
 */

export default class GeneratePacket extends XQModule {
  /** The required fields of the payload needed to utilize the service */
  requiredFields: string[];

  /** Specified name of the service */
  serviceName: string;

  /** The field name representing the boolean value which specifies if the content should be deleted after opening */
  static DELETE_ON_RECEIPT: "dor" = "dor";

  /** The field name representing the number of hours of life span until access to the encrypted text is expired */
  static EXPIRES_HOURS: "expires" = "expires";

  /** The field name representing the encryption key */
  static KEY: "key" = "key";

  /** The field name representing the list of emails of users intended to have read access to the encrypted content */
  static RECIPIENTS: "recipients" = "recipients";

  /** The field name representing the type of communication that the user is encrypting (ex. File, Email, Chat, etc.) */
  static TYPE: "type" = "type";

  /** The field name representing the arbitrary metadata the user would like to attach to the log of the encrypted payload */
  static META: "meta" = "meta";

  /**
   * @param {Map} maybePayLoad - Container for the request parameters supplied to this method.
   * @param {String} maybePayLoad.key - The secret key that the user wants to protect.
   * @param {Long} maybePayLoad.expires - The number of hours that this key will remain valid for. After this time, it will no longer be accessible.
   * @param {[String]} maybePayLoad.recipients  -  list of emails of those recipients who are allowed to access the key.
   * @param {Boolean} [maybePayLoad.dor=false] - Should the content be deleted after opening.
   * @param {String} maybePayLoad.type - an optional string value which specifies the type of communication the user is encrypting. Defaults to `unknown`
   * @param {Map} maybePayLoad.meta - an optional map value which can contain any arbitrary metadata the user wants
   *
   * @returns {Promise<ServerResponse<{payload:string}>>}
   */
  supplyAsync: (maybePayload: IGeneratePacketParams) => Promise<ServerResponse>;

  constructor(sdk: XQSDK) {
    super(sdk);

    this.serviceName = "packet";
    this.requiredFields = [
      GeneratePacket.KEY,
      GeneratePacket.RECIPIENTS,
      GeneratePacket.EXPIRES_HOURS,
    ];

    this.supplyAsync = (maybePayLoad) => {
      try {
        this.sdk.validateInput(maybePayLoad, this.requiredFields);
        const accessToken = this.sdk.validateAccessToken();

        const additionalHeaderProperties = {
          Authorization: "Bearer " + accessToken,
        };

        const flattenedRecipientList =
          maybePayLoad[GeneratePacket.RECIPIENTS].join(",");

        const payload = {
          ...maybePayLoad,
          [GeneratePacket.RECIPIENTS]: flattenedRecipientList,
        };

        return this.sdk
          .call(
            this.sdk.SUBSCRIPTION_SERVER_URL,
            this.serviceName,
            CallMethod.POST,
            additionalHeaderProperties,
            payload,
            true
          )
          .then((response: ServerResponse) => {
            switch (response.status) {
              case ServerResponse.OK: {
                return this.sdk.call(
                  this.sdk.VALIDATION_SERVER_URL,
                  this.serviceName,
                  CallMethod.POST,
                  {
                    ...additionalHeaderProperties,
                    [XQSDK.CONTENT_TYPE]: XQSDK.TEXT_PLAIN_UTF_8,
                  },
                  { data: response.payload },
                  true
                );
              }
              case ServerResponse.ERROR: {
                return handleException(response, XQServices.GeneratePacket);
              }
            }
          });
      } catch (exception) {
        return new Promise((resolve) =>
          resolve(handleException(exception, XQServices.GeneratePacket))
        );
      }
    };
  }
}
