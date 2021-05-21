export interface ServerResponseProps {
  status: string;
  statusCode: number;
  payload: any;
}

interface ServerResponse extends ServerResponseProps {}

/**
 *
 * @property {Answered} status - binary reply from server.
 * @property {Number} code - A numeric representation of the actual status returned from the server. To be used for more specific error handling.
 * @property {Map<String,Any>} payload - The data that is being returned form the server
 *
 *  @class [ServerResponse]
 */

class ServerResponse {
  status: string;
  statusCode: number;
  payload: any;

  static OK: string;
  static ERROR: string;

  /**
   * @param {Answered} status
   * @param {Number}  code
   * @param {Map|Object} data
   */
  constructor(status: string, code: number, data: any) {
    this.status = status;
    this.statusCode = code;
    this.payload = data;
  }
}

ServerResponse.OK = "OK";
ServerResponse.ERROR = "ERROR";

export default ServerResponse;
