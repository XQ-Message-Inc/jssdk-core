export default class StatusException {
  code: number;
  reason: string;
  notImplemented: () => StatusException;

  /**
   * @param {Number} code
   * @param {String} reason
   */
  constructor(code: number, reason: string) {
    this.code = code;
    this.reason = reason;

    this.notImplemented = () => {
      return new StatusException(501, "501 Not Implemented");
    };
  }
}
