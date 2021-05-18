export default class StatusException {
  constructor(code, reason) {
    this.code = code;
    this.reason = reason;

    this.notImplemented = () => {
      return new StatusException(501, "501 Not Implemented");
    };

    this.code = () => {
      return this.code;
    };

    this.reason = () => {
      return this.reason;
    };
  }
}
