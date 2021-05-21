import XQModule, { SupplyAsync } from "../services/XQModule";
import CallMethod from "../CallMethod";
import XQSDK from "../XQSDK";
import ServerResponse from "../ServerResponse";

/**
 * Fetches quantum entropy from the server. When the user makes the request, <br>
 * they must include the number of entropy bits to fetch.
 * In order to reduce the amount of data the quantum server emits, <br>
 * the entropy is sent as a base64-encoded hex string. <br>
 * While the hex string itself can be used as entropy, to retrieve the actual bits ( if required ),<br>
 * the string should be decoded from base-64, and each hex character in the sequence converted to its <br>
 * 4-bit binary representation.
 */
export default class FetchQuantumEntropy extends XQModule {
  supplyAsync: SupplyAsync;
  static KS: string;
  static _256: string;

  constructor(sdk: XQSDK) {
    super(sdk);

    /**
     *
     * @param {{}} maybePayLoad:
     * @returns {Promise<ServerResponse<{payload:string}>>}
     */
    this.supplyAsync = (maybePayLoad) => {
      try {
        let additionalHeaderProperties = {
          [XQSDK.CONTENT_TYPE]: XQSDK.TEXT_PLAIN_UTF_8,
        };

        return this.sdk.call(
          this.sdk.KEY_SERVER_URL,
          null,
          CallMethod.GET,
          additionalHeaderProperties,
          maybePayLoad,
          false
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

FetchQuantumEntropy.KS = "ks";
FetchQuantumEntropy._256 = "256";
