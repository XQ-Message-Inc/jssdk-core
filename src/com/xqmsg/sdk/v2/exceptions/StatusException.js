export default class StatusException {
  constructor(code, reason) {
    this.code = code;
    this.reason = reason;
  }

  notImplemented = function () {
    return new StatusException(501, "501 Not Implemented");
  };

  code = function () {
    return this.code;
  };

  reason = function () {
    return this.reason;
  };
}
