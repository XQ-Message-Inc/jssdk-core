/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * @class [ServerResponse]
 */
class ServerResponse {
  /** A binary reply from server */
  status: string;

  /** A numeric representation of the actual status returned from the server. To be used for more specific error handling. */
  statusCode: number;

  /** The data that is being returned form the server */
  payload: any;

  static OK: "OK" = "OK";
  static ERROR: "ERROR" = "ERROR";

  /**
   * @param {Answered} status
   * @param {Number}  code
   * @param {Map|Object|String} data
   */
  constructor(status: string, code: number, data: any) {
    this.status = status;
    this.statusCode = code;
    this.payload = data;
  }
}

export default ServerResponse;
