/**
 * Enum to specify Notification Settings<br>
 *
 * @class [NotificationEnum]
 **/
export default class  NotificationEnum {}

/**
 * Maps numeric value to its respective textual representation
 * @param {Number} opt - Selected Option
 * @return {String} - String Representation of the Option
 */
NotificationEnum.prototype.parseValue = function(opt) {
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
}


/**
 * @type {NONE,USAGE_REPORTS,TUTORIALS,BOTH}
 * @property {Number} NONE  - No Notifications
 * @property {Number} USAGE_REPORTS  - Receive Usage Reports
 * @property {Number} TUTORIALS  - Receive Tutorials
 * @property {Number} BOTH  - Receive Both
 */
NotificationEnum.prototype.NONE=0;
NotificationEnum.prototype.USAGE_REPORTS=1;
NotificationEnum.prototype.TUTORIALS=2;
NotificationEnum.prototype.BOTH=3;