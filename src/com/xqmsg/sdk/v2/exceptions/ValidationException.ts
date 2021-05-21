export default class ValidationException {
  code: number;
  reason: string;

  /**
   * @param {Number} code
   * @param {String} reason
   */
  constructor(code: number, reason: string) {
    this.code = code;
    this.reason = reason;
  }
}
