/**
 * A utility function used to determine whether an JWT is expired or not.
 * @note - this function does not verify the JWT signature is valid and optional expiration, audience, or issuer are valid.
 * @param token - a string value representing the JWT
 * @returns boolean
 */
const verifyJWTExpiration = (token: string): boolean => {
  const payloadBase64 = token.split(".")[1];
  const decodedJson = Buffer.from(payloadBase64, "base64").toString();
  const decoded = JSON.parse(decodedJson);
  const exp = decoded.exp;
  const expired = Date.now() >= exp * 1000;
  return expired;
};

export default verifyJWTExpiration;
