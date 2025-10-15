/**
 * An Enum to chose from a finite selection of destination servers for {@link XQSDK#call}s.
 *
 * @class [Destination]
 */
export default class Destination {
  /** A value representing the destination server for XQ general API calls */
  static XQ: "XQ" = "XQ";
  /** A value representing the destination server for Dashboard API calls */
  static DASHBOARD: "DASHBOARD" = "DASHBOARD";
  /** A value representing the destination server for Delta API v3 calls */
  static DELTA: "DELTA" = "DELTA";
}
