/**
 * Enum to specify Business Roles<br>
 *
 * @class [RolesEnum]
 **/
export default class RolesEnum {}

/**
 * Maps numeric value to its respective textual representation
 * @param {Number} opt - Selected Option
 * @return {String} - String Representation of the Option
 */
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

/**
 * @type {UNKNOWN, ADMIN, USER, CUSTOMER, VENDOR, SUPER_USER, DEVICE, ALIAS}
 * @property {Number} UNKNOWN  - Cannot do anything
 * @property {Number} ADMIN  - Can login to dashboard with will authority for the business
 * @property {Number} USER  - Can login to dashboard with restricted permissions ( cannot add other users )
 * @property {Number} CUSTOMER  - Cannot login to dashboard
 * @property {Number} VENDOR  -  Cannot login to dashboard
 * @property {Number} SUPER_USER  - Can do everything on an account, including billing
 * @property {Number} DEVICE  - A virtual user is a generated email address that is fully tracked, but cannot be used to log into the dashboard at all.
 * @property {Number} ALIAS  - An Alias role is similar is an anonymous alias that is trackable by an SMB.
 */

RolesEnum.UNKNOWN = 0;
RolesEnum.ADMIN = 1;
RolesEnum.USER = 2;
RolesEnum.CUSTOMER = 3;
RolesEnum.VENDOR = 4;
RolesEnum.SUPER_USER = 5;
RolesEnum.DEVICE = 6;
RolesEnum.ALIAS = 7;
