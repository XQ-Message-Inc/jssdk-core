/**
 * An Enum to chose from a finite selection of destination servers for {@link XQSDK#call}s.
 *
 * @class [Destination]
 */
export default class Destination {
  static XQ: string;
  static DASHBOARD: string;
}

Destination.XQ = "XQ";
Destination.DASHBOARD = "DASHBOARD";
