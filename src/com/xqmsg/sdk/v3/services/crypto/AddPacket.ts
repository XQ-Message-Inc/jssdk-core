import CallMethod from "../../../shared/CallMethod";
import Destination from "../../../shared/Destination";
import ServerResponse from "../../../shared/ServerResponse";
import handleException from "../../../shared/exceptions/handleException";
import { XQServices } from "../../../shared/XQServicesEnum";
import XQModule from "../../XQModule";
import XQSDKv3 from "../../XQSDKv3";

export interface IAddPacketParams {
  key: string;
  expires: number;
  recipients: string[] | string;
  dor?: boolean;
  type?: string;
  meta?: Record<string, unknown> | null;
  [key: string]: unknown;
}

/**
 * Store an encryption packet in Delta and receive a locator token.
 */
export default class AddPacket extends XQModule {
  /** Specified name of the service */
  serviceName: string;

  /** Required payload fields */
  requiredFields: string[];

  /** Payload field containing the encryption key */
  static KEY: "key" = "key";

  /** Payload field containing the expiration (hours) */
  static EXPIRES_HOURS: "expires" = "expires";

  /** Payload field containing allowed recipients */
  static RECIPIENTS: "recipients" = "recipients";

  /** Payload field indicating delete-on-receipt */
  static DELETE_ON_RECEIPT: "dor" = "dor";

  /** Payload field describing the communication type */
  static TYPE: "type" = "type";

  /** Payload field for arbitrary metadata */
  static META: "meta" = "meta";

  supplyAsync: (
    maybePayload: IAddPacketParams
  ) => Promise<ServerResponse>;

  constructor(sdk: XQSDKv3) {
    super(sdk);

    this.serviceName = "packet/add";
    this.requiredFields = [
      AddPacket.KEY,
      AddPacket.RECIPIENTS,
      AddPacket.EXPIRES_HOURS,
    ];

    this.supplyAsync = (maybePayload) => {
      try {
        this.sdk.validateInput(maybePayload as Record<string, unknown>, this.requiredFields);
        const accessToken = this.sdk.validateAccessToken(Destination.DELTA);

        const headers = {
          Authorization: "Bearer " + accessToken,
        };

        const normalizedRecipients = (() => {
          const recipients = maybePayload[AddPacket.RECIPIENTS];
          if (Array.isArray(recipients)) {
            return recipients;
          }
          if (typeof recipients === "string") {
            return recipients
              .split(",")
              .map((entry) => entry.trim())
              .filter((entry) => entry.length > 0);
          }
          return [] as string[];
        })();

        const payload = {
          ...maybePayload,
          [AddPacket.RECIPIENTS]: normalizedRecipients,
        };

        return this.sdk
          .call(
            this.sdk.DELTA_SERVER_URL,
            this.serviceName,
            CallMethod.POST,
            headers,
            payload as Record<string, unknown>,
            true,
            Destination.DELTA
          )
          .then((response: ServerResponse) => {
            if (response.status === ServerResponse.OK) {
              return response;
            }

            return handleException(response, XQServices.AddPacket);
          });
      } catch (exception) {
        return new Promise((resolve) =>
          resolve(handleException(exception, XQServices.AddPacket))
        );
      }
    };
  }
}
