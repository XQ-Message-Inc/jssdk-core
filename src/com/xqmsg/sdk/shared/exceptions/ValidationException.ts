import XQException from "./XQException";

export default class ValidationException  extends XQException{

  /**
   * @param {Number} code
   * @param {String} reason
   */
  constructor(code: number, reason: string) {
    super(code, reason);
  }
}
