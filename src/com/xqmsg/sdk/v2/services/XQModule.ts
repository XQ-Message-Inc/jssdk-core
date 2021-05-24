/* eslint-disable @typescript-eslint/no-explicit-any */
import XQSDK from "../XQSDK";

/**
 * @class [XQModule]
 */
export default class XQModule {
  sdk: any;
  cache: any;
  assert: (condition: boolean, message: string) => void;
  getCache: () => any;

  constructor(sdk: XQSDK) {
    this.sdk = sdk;
    this.cache = sdk.getCache();

    this.assert = (condition, message) => {
      if (!condition) {
        const msg = message || "Assertion failed";
        console.info(msg);
        throw msg;
      }
    };

    /**
     * @return SimpleXQCache
     */
    this.getCache = () => {
      return this.cache;
    };
  }
}
