import { XQEncryptionAlgorithms, XQServices } from "../XQServicesEnum";
import ServerResponse from "../ServerResponse";
import StatusException from "./StatusException";
import ValidationException from "./ValidationException";
import XQException from "./XQException";

const handleException = (
  e: unknown,
  serviceName?: XQServices | XQEncryptionAlgorithms,
  customInput?: string
) => {
  const serviceErrorMessage =
    customInput || serviceName
      ? `${customInput || serviceName} failed`
      : "operation failed";
  if("string" === typeof e){
    const message = e as String;
    return new ServerResponse(
      ServerResponse.ERROR,
      500,
      `${serviceErrorMessage}, reason: ${message}`
    );
  }
  else if (e instanceof Object) {
    const error = e as Object;
    switch (error.constructor) {
      case ServerResponse: {
        const serverResponseError = error as ServerResponse;
        console.error(
          `${serviceErrorMessage}, code: ${serverResponseError.statusCode}, reason: ${serverResponseError.payload}`
        );

        return new ServerResponse(
          ServerResponse.ERROR,
          serverResponseError.statusCode,
          serverResponseError.payload
        );
      }
      case ValidationException:
      case StatusException:
      case XQException: {
        const xqException = error as XQException;
        return new ServerResponse(
          ServerResponse.ERROR,
          xqException.code,
          xqException.reason
        );
      }

      default:
        return new ServerResponse(
          ServerResponse.ERROR,
          500,
          `${serviceName} failed`
        );
    }
  }
  else {
    return new ServerResponse(
      ServerResponse.ERROR,
      500,
      `${serviceName} failed`
    );
  }
};

export default handleException;
