import CallMethod from "../../../shared/CallMethod";
import Destination from "../../../shared/Destination";
import ServerResponse from "../../../shared/ServerResponse";
import handleException from "../../../shared/exceptions/handleException";
import { XQServices } from "../../../shared/XQServicesEnum";
import XQModule from "../../XQModule";
import XQSDKv3 from "../../XQSDKv3";

export interface ILookupKeyParams {
  token: string;
}

/**
 * Retrieve a stored key packet using a locator token.
 */
export default class LookupKey extends XQModule {
  /** Specified name of the service */
  serviceName: string;

  /** Required payload fields */
  requiredFields: string[];

  /** Path parameter for the locator token */
  static TOKEN: "token" = "token";

  supplyAsync: (
    maybePayload: ILookupKeyParams
  ) => Promise<ServerResponse>;

  constructor(sdk: XQSDKv3) {
    super(sdk);

    this.serviceName = "key";
    this.requiredFields = [LookupKey.TOKEN];

    this.supplyAsync = (maybePayload) => {
      try {
        const locatorToken = maybePayload[LookupKey.TOKEN];
        const validationPayload = { [LookupKey.TOKEN]: locatorToken };

        this.sdk.validateInput(validationPayload, this.requiredFields);
        const accessToken = this.sdk.validateAccessToken(Destination.DELTA);

        const headers = {
          Authorization: "Bearer " + accessToken,
        };

        return this.sdk
          .call(
            this.sdk.DELTA_SERVER_URL,
            `${this.serviceName}/${encodeURIComponent(locatorToken)}`,
            CallMethod.GET,
            headers,
            null,
            true,
            Destination.DELTA
          )
          .then((response: ServerResponse) => {
            if (response.status === ServerResponse.OK) {
              const payload = response.payload;

              if (typeof payload === "string" && payload.startsWith(".")) {
                return new ServerResponse(
                  ServerResponse.OK,
                  response.statusCode,
                  payload.substring(2)
                );
              }

              return response;
            }

            return handleException(response, XQServices.LookupKey);
          });
      } catch (exception) {
        return new Promise((resolve) =>
          resolve(handleException(exception, XQServices.LookupKey))
        );
      }
    };
  }
}
