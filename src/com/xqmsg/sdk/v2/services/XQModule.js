import ValidationException from "../exceptions/ValidationException.js";
import StatusException from "../exceptions/StatusException.js";

/**
 * @class [XQModule]
 */
export default class XQModule {
  constructor(sdk) {
    this.sdk = sdk;
    this.cache = sdk.getCache();

    this.assert = (condition, message) => {
      if (!condition) {
        let msg = message || "Assertion failed";
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
