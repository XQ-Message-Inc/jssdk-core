type RoleEnumTypes =
  | "UNKNOWN"
  | "ADMIN"
  | "USER"
  | "CUSTOMER"
  | "VENDOR"
  | "SUPER_USER"
  | "DEVICE"
  | "ALIAS";

/**
 * An Enum used to specify Business Roles<
 *
 * @class [RolesEnum]
 **/
export default class RolesEnum {
  /** A role which can login to dashboard with will authority for the business */
  static ADMIN: 1;

  /** An alias role which is similar to an anonymous alias that is trackable by an SMB. */
  static ALIAS: 7;

  /** A role for a customer which cannot login to dashboard */
  static CUSTOMER: 3;

  /** A role which represents a virtual user that is a generated email address which is fully tracked, but cannot be used to log into the dashboard at all. */
  static DEVICE: 6;

  /** A role which represents an admin user with full authority, including billing */
  static SUPER_USER: 5;

  /** A role which cannot do anything */
  static UNKNOWN: 0;

  /** A role which can login to dashboard with restricted permissions ( cannot add other users ) */
  static USER: 2;

  /** A role for a vendor which cannot login to dashboard */
  static VENDOR: 4;

  /**
   * Maps numeric value to its respective textual representation
   * @param {Number} opt - Selected Option
   * @return {String} - String Representation of the Option
   */
  static parseValue: (opt: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7) => RoleEnumTypes;
}

RolesEnum.parseValue = function (opt) {
  switch (opt) {
    case this.UNKNOWN:
      return "UNKNOWN";
    case this.ADMIN:
      return "ADMIN";
    case this.USER:
      return "USER";
    case this.CUSTOMER:
      return "CUSTOMER";
    case this.VENDOR:
      return "VENDOR";
    case this.SUPER_USER:
      return "SUPER_USER";
    case this.DEVICE:
      return "DEVICE";
    case this.ALIAS:
      return "ALIAS";
  }
};
