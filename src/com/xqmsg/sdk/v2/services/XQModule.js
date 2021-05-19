import ValidationException from "../exceptions/ValidationException.js";
import StatusException from "../exceptions/StatusException.js";

/**
 * @class [XQModule]
 */
export default class XQModule {
  constructor(sdk) {
    this.sdk = sdk;
    this.cache = sdk.getCache();
  }

  assert = function (condition, message) {
    if (!condition) {
      let msg = message || "Assertion failed";
      console.info(msg);
      throw msg;
    }
  };

  /**
   * @return SimpleXQCache
   */
  getCache = function () {
    return this.cache;
  };
}
