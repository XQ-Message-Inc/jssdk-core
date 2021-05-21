import StatusException from "../exceptions/StatusException.js";

export default class XQSimpleCache {
  /**
   *
   * @param {Storage} storage
   */
  constructor(storage) {
    if (!("caches" in window)) {
      prompt("no cache mechanism");
    }
    this.storage = storage;
    this.XQ_PREFIX = "xq";
    this.DASHBOARD_PREFIX = "dsb";
    this.EXCHANGE_PREFIX = "exchange";
    this.PROFILE_LIST_KEY = "available-profiles";
    this.ACTIVE_PROFILE_KEY = "active-profile";

    this.putXQPreAuthToken = (user, preAuthToken) => {
      this.storage.setItem(this.makeExchangeKey(user), preAuthToken);
    };

    this.getXQPreAuthToken = (user) => {
      const preAuthToken = this.storage.getItem(this.makeExchangeKey(user));
      if (preAuthToken == undefined) {
        return null;
      }
      return preAuthToken;
    };

    this.removeXQPreAuthToken = (user) => {
      let xqPreAuthToken = this.getXQPreAuthToken(user);
      if (xqPreAuthToken != null) {
        this.storage.removeItem(this.makeExchangeKey(user));
      }
    };

    this.putXQAccess = (user, accessToken) => {
      this.storage.setItem(this.makeXQAccessKey(user), accessToken);
    };

    this.getXQAccess = (user, required) => {
      const accessToken = this.storage.getItem(this.makeXQAccessKey(user));
      if (required && accessToken == undefined) {
        throw new StatusException(401, "401 Unauthorized");
      } else {
        return accessToken;
      }
    };

    this.removeXQAccess = (user) => {
      let accessToken = this.getXQAccess(user);
      if (accessToken != null) {
        let success = this.storage.removeItem(this.makeXQAccessKey(user));
      }
    };

    this.putDashboardAccess = (user, accessToken) => {
      this.storage.setItem(this.makeDashboardAccessKey(user), accessToken);
    };

    this.getDashboardAccess = (user, required) => {
      const dashboardAccessToken = this.storage.getItem(
        this.makeDashboardAccessKey(user)
      );
      if (required && dashboardAccessToken == undefined) {
        throw new StatusException(401, "401 Unauthorized");
      } else {
        return dashboardAccessToken;
      }
    };

    this.removeDashboardAccess = (user) => {
      let dashboardAccessToken = this.getDashboardAccess(user);
      if (dashboardAccessToken != null) {
        let success = this.storage.removeItem(
          this.makeDashboardAccessKey(user)
        );
      }
    };

    this.hasProfile = (user) => {
      const availableProfiles = this.listProfiles();

      return availableProfiles.includes(user);
    };

    this.putActiveProfile = (user) => {
      let self = this;
      let availableProfiles = this.listProfiles();
      if (availableProfiles.length == 0) {
        self.storage.setItem(this.PROFILE_LIST_KEY, user);
      } else {
        if (!availableProfiles.includes(user)) {
          availableProfiles.push(user);
          let merged = availableProfiles.join(",");
          self.storage.setItem(this.PROFILE_LIST_KEY, merged);
        }
      }
      this.storage.setItem(this.ACTIVE_PROFILE_KEY, user);
    };

    this.putProfile = (user) => {
      const availableProfiles = this.listProfiles();
      if (availableProfiles.length == 0) {
        this.storage.setItem(this.PROFILE_LIST_KEY, [user]);
      } else {
        availableProfiles.push(user);
        let merged = availableProfiles.join(",");
        this.storage.setItem(this.PROFILE_LIST_KEY, merged);
      }

      if (this.getActiveProfile(false) == null) {
        this.storage.setItem(this.ACTIVE_PROFILE_KEY, user);
      }
    };

    this.getActiveProfile = (required) => {
      let activeProfile = this.storage.getItem(this.ACTIVE_PROFILE_KEY);

      if (required && activeProfile == null) {
        throw new StatusException(401, "401 Unauthorized");
      } else {
        if (activeProfile == null) {
          return null;
        }
        return activeProfile;
      }
    };

    this.removeProfile = (user) => {
      const availableProfiles = this.listProfiles();
      let profilesSansUser = availableProfiles.filter(
        (profile) => profile != user
      );
      this.storage.setItem(this.PROFILE_LIST_KEY, profilesSansUser);
      this.removeXQPreAuthToken(user);
      this.removeXQAccess(user);
      this.removeDashboardAccess(user);
    };

    this.clearAllProfiles = () => {
      let availableProfiles = this.listProfiles();

      for (var i = 0; i < availableProfiles.length; i++) {
        let user = this.getActiveProfile(false);

        this.removeXQPreAuthToken(user);
        this.removeXQAccess(user);
        this.removeDashboardAccess(user);
        break;
      }
      this.storage.removeItem(this.ACTIVE_PROFILE_KEY);
      this.storage.removeItem(this.PROFILE_LIST_KEY);
    };

    /**
     * @returns {[]} profiles
     */
    this.listProfiles = () => {
      let profiles = this.storage.getItem(this.PROFILE_LIST_KEY);
      if (profiles != null) {
        return profiles.split(",");
      } else {
        return [];
      }
    };

    this.makeExchangeKey = (unvalidatedUser) => {
      return `${this.EXCHANGE_PREFIX}-${this.XQ_PREFIX}-${unvalidatedUser}`;
    };

    this.makeXQAccessKey = (validatedUser) => {
      return `${this.XQ_PREFIX}-${validatedUser}`;
    };

    this.makeDashboardAccessKey = (validatedUser) => {
      return `${this.DASHBOARD_PREFIX}-${validatedUser}`;
    };
  }
}
