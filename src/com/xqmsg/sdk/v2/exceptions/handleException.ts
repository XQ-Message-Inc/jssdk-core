import { XQEncryptionAlgorithms, XQServices } from "../XQServicesEnum";
import ServerResponse from "../ServerResponse";

const handleException = (
  error: unknown,
  serviceName?: XQServices | XQEncryptionAlgorithms,
  customInput?: string
) => {
  const isServerResponse = error instanceof ServerResponse;
  const serviceErrorMessage =
    customInput || serviceName
      ? `${customInput || serviceName} failed`
      : "operation failed";

  if (isServerResponse) {
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

  return new ServerResponse(ServerResponse.ERROR, 500, `${serviceName} failed`);
};

export default handleException;
