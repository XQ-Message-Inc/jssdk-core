type NotificationEnumTypes = "NONE" | "USAGE_REPORTS" | "TUTORIALS" | "BOTH";

/**
 * An Enum used to specify Notification Settings
 *
 * @class [NotificationEnum]
 **/
export default class NotificationEnum {
  static parseValue: (opt: 0 | 1 | 2 | 3) => NotificationEnumTypes;
  /** The `NotificationEnum` numerical value representing: No Notifications */
  static NONE: 0;

  /** The `NotificationEnum` numerical value representing: Usage Reports */
  static USAGE_REPORTS: 1;

  /** The `NotificationEnum` numerical value representing: Tutorials */
  static TUTORIALS: 2;

  /** The `NotificationEnum` numerical value representing: Both */
  static BOTH: 3;
}

/**
 * Maps numeric value to its respective textual representation
 * @param {Number} opt - Selected Option
 * @return {String} - String Representation of the Option
 */
NotificationEnum.parseValue = function (opt) {
  switch (opt) {
    case this.NONE:
      return "NONE";
    case this.USAGE_REPORTS:
      return "USAGE_REPORTS";
    case this.TUTORIALS:
      return "TUTORIALS";
    case this.BOTH:
      return "BOTH";
  }
};
