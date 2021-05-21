type NotificationEnumTypes = "NONE" | "USAGE_REPORTS" | "TUTORIALS" | "BOTH";

/**
 * Enum to specify Notification Settings<br>
 *
 * @class [NotificationEnum]
 **/
export default class NotificationEnum {
  static parseValue: (opt: number) => NotificationEnumTypes;
  static NONE: number;
  static USAGE_REPORTS: number;
  static TUTORIALS: number;
  static BOTH: number;
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
    default: {
      return "NONE";
    }
  }
};

/**
 * @type {NONE,USAGE_REPORTS,TUTORIALS,BOTH}
 * @property {Number} NONE  - No Notifications
 * @property {Number} USAGE_REPORTS  - Receive Usage Reports
 * @property {Number} TUTORIALS  - Receive Tutorials
 * @property {Number} BOTH  - Receive Both
 */
NotificationEnum.NONE = 0;
NotificationEnum.USAGE_REPORTS = 1;
NotificationEnum.TUTORIALS = 2;
NotificationEnum.BOTH = 3;
