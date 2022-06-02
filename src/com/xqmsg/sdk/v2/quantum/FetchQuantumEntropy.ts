import CallMethod from "../CallMethod";
import ServerResponse from "../ServerResponse";
import XQModule from "../services/XQModule";
import XQSDK from "../XQSDK";
import { XQServices } from "../XQServicesEnum";

import handleException from "../exceptions/handleException";

/**
 * Fetches quantum entropy from the server. When the user makes the request,
 * they must include the number of entropy bits to fetch.
 * In order to reduce the amount of data the quantum server emits,
 * the entropy is sent as a base64-encoded hex string.
 *
 * While the hex string itself can be used as entropy, to retrieve the actual bits ( if required ),
 * the string should be decoded from base-64, and each hex character in the sequence converted to its
 * 4-bit binary representation.
 */
export default class FetchQuantumEntropy extends XQModule {
  /** Kolmogorov-Sinai entropy */
  static KS: "ks" = "ks";

  /** The number of entropy bits to fetch */
  static _256: "256" = "256";

  /**
   * @param {Map} maybePayLoad - Container for the request parameters supplied to this method.
   * @param {String} ks -  The number of entropy bits to fetch
   * @returns {Promise<ServerResponse<{payload:{data:string}}>>}
   */
  supplyAsync: (maybePayload: {
    [FetchQuantumEntropy.KS]: string;
  }) => Promise<ServerResponse>;

  constructor(sdk: XQSDK) {
    super(sdk);

    this.supplyAsync = (maybePayLoad) => {
      try {
        const additionalHeaderProperties = {
          [XQSDK.CONTENT_TYPE]: XQSDK.TEXT_PLAIN_UTF_8,
        };

        return this.sdk
          .call(
            this.sdk.KEY_SERVER_URL,
            null,
            CallMethod.GET,
            additionalHeaderProperties,
            maybePayLoad,
            false
          )
          .then((response: ServerResponse) => {
            switch (response.status) {
              case ServerResponse.OK: {
                return response;
              }
              case ServerResponse.ERROR: {
                return handleException(
                  response,
                  XQServices.FetchQuantumEntropy
                );
              }
            }
          });
      } catch (exception) {
        return handleException(exception, XQServices.FetchQuantumEntropy);
      }
    };
  }
}
