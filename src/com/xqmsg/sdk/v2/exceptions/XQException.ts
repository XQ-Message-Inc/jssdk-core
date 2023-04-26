export default class XQException {
  code: number;
  reason: string;
  constructor(code: number, reason: string) {
    this.code = code;
    this.reason = reason;
  }
}
