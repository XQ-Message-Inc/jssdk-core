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
 * Enum to specify Business Roles<br>
 *
 * @class [RolesEnum]
 **/
export default class RolesEnum {
  static ADMIN: number; // Can login to dashboard with will authority for the busines
  static ALIAS: number; // An Alias role is similar is an anonymous alias that is trackable by an SMB.
  static CUSTOMER: number; // Cannot login to dashboard
  static DEVICE: number; // A virtual user is a generated email address that is fully tracked, but cannot be used to log into the dashboard at all.
  static SUPER_USER: number; // Can do everything on an account, including billing
  static UNKNOWN: number; // Cannot do anything
  static USER: number; // Can login to dashboard with restricted permissions ( cannot add other users )
  static VENDOR: number; // Cannot login to dashboard
  static parseValue: (opt: number) => RoleEnumTypes;
}

/**
 * Maps numeric value to its respective textual representation
 * @param {Number} opt - Selected Option
 * @return {String} - String Representation of the Option
 */
RolesEnum.parseValue = function (opt: number) {
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
    default: {
      return "UNKNOWN";
    }
  }
};

RolesEnum.UNKNOWN = 0;
RolesEnum.ADMIN = 1;
RolesEnum.USER = 2;
RolesEnum.CUSTOMER = 3;
RolesEnum.VENDOR = 4;
RolesEnum.SUPER_USER = 5;
RolesEnum.DEVICE = 6;
RolesEnum.ALIAS = 7;
