import CallMethod from "../../../shared/CallMethod";
import Destination from "../../../shared/Destination";
import ServerResponse from "../../../shared/ServerResponse";
import handleException from "../../../shared/exceptions/handleException";
import { XQServices } from "../../../shared/XQServicesEnum";
import XQModule from "../../XQModule";
import XQSDKv3 from "../../XQSDKv3";

export interface IFetchEntropyParams {
  length?: number;
  type?: string;
  [key: string]: string | number | undefined;
}

/**
 * Fetch fresh entropy from the Delta API quantum endpoint.
 */
export default class FetchEntropy extends XQModule {
  /** Specified name of the service */
  serviceName: string;

  /** Required payload fields */
  requiredFields: string[];

  /** Default entropy length (bytes) */
  static DEFAULT_LENGTH = 32;

  /** Default entropy encoding */
  static DEFAULT_TYPE = "uint8";

  /** Query parameter name for requested length */
  static LENGTH: "length" = "length";

  /** Query parameter name for requested type */
  static TYPE: "type" = "type";

  supplyAsync: (
    maybePayload?: IFetchEntropyParams
  ) => Promise<ServerResponse>;

  constructor(sdk: XQSDKv3) {
    super(sdk);

    this.serviceName = "qrng";
    this.requiredFields = [];

    this.supplyAsync = (maybePayload = {}) => {
      try {
        this.sdk.validateInput(maybePayload as Record<string, unknown>, this.requiredFields);
        const accessToken = this.sdk.validateAccessToken(Destination.DELTA);

        const headers = {
          Authorization: "Bearer " + accessToken,
        };

        const payload: Record<string, string> = {};
        const length = maybePayload[FetchEntropy.LENGTH] ?? FetchEntropy.DEFAULT_LENGTH;
        const type = maybePayload[FetchEntropy.TYPE] ?? FetchEntropy.DEFAULT_TYPE;

        payload[FetchEntropy.LENGTH] = String(length);
        payload[FetchEntropy.TYPE] = String(type);

        Object.entries(maybePayload).forEach(([key, value]) => {
          if (value != null && key !== FetchEntropy.LENGTH && key !== FetchEntropy.TYPE) {
            payload[key] = String(value);
          }
        });

        return this.sdk
          .call(
            this.sdk.DELTA_SERVER_URL,
            this.serviceName,
            CallMethod.GET,
            headers,
            payload,
            true,
            Destination.DELTA
          )
          .then((response: ServerResponse) => {
            if (response.status === ServerResponse.OK) {
              return response;
            }

            return handleException(response, XQServices.FetchEntropy);
          });
      } catch (exception) {
        return new Promise((resolve) =>
          resolve(handleException(exception, XQServices.FetchEntropy))
        );
      }
    };
  }
}
