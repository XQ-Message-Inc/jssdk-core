/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-redeclare */
export interface ServerResponseProps {
  status: string;
  statusCode: number;
  payload: any;
}

interface ServerResponse extends ServerResponseProps {}

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

  static OK: "OK";
  static ERROR: "ERROR";

  /**
   * @param {Answered} status
   * @param {Number}  code
   * @param {Map|Object} data
   */
  constructor(status: string, code: number, data: string) {
    this.status = status;
    this.statusCode = code;
    this.payload = data;
  }
}

export default ServerResponse;
