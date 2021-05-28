import StatusException from "../exceptions/StatusException";
import ServerResponse from "../ServerResponse";

/**
 * @class [XQSimpleCache]
 */
export default class XQSimpleCache {
  /** The field name for `storage` object representing the current active profile */
  ACTIVE_PROFILE_KEY = "active-profile";

  /** The prefix used for the dashboard application used in the `makeDashboardAccessKey` method. The prefix is prepended to the `user` and the result is used as a field name for the `storage` object */
  DASHBOARD_PREFIX = "dsb";

  /** A prefix used for the dashboard application used in the `makeXQAccessKey` method. The prefix is prepended to the `XQ_PREFIX` and `user` string and the result is used as a field name for the `storage` object */
  EXCHANGE_PREFIX = "exchange";

  /** The field name for `storage` object representing the lists of available profiles */
  PROFILE_LIST_KEY = "available-profiles";

  /** A prefix for xq used in various field names for the `storage` object */
  XQ_PREFIX = "xq";

  /** A function which removes all profiles from the `storage` object */
  clearAllProfiles: () => void;

  /** A function which retrieves the active profile from the `storage` object */
  getActiveProfile: (required: boolean) => string | null;

  /** A function which is used to request dashboard access */
  getDashboardAccess: (
    user: string,
    required?: boolean
  ) => StatusException | string;

  /** A function which is used to request general XQ access */
  getXQAccess: (user: string, required?: boolean) => StatusException | string;

  /** A function which is used to request an XQ pre-authentication token */
  getXQPreAuthToken: (user: string) => string | null;

  /** A function which is used to find if the requested user has a profile in the available profiles stored in the `storage` object */
  hasProfile: (user: string) => boolean;

  /** A function used to list all available profiles stored in the `storage` object */
  listProfiles: () => string[];

  /** A function used to create a dashboard access key for a given user */
  makeDashboardAccessKey: (user: string) => string;

  /** A function used to create a exchange access key for a given user */
  makeExchangeKey: (user: string) => string;

  /** A function used to create an XQ access key for a given user */
  makeXQAccessKey: (user: string) => string;

  /** A function used to store a user as an active profile in the `storage` object */
  putActiveProfile: (user: string) => void;

  /** A function used to grant a user dashboard access using an associated key and storing it in the `storage` object */
  putDashboardAccess: (user: string, accessToken: string) => void;

  /** A function used to store a user's profile in the `storage` object */
  putProfile: (user: string) => void;

  /** A function used to grant a user general XQ access */
  putXQAccess: (user: string, accessToken: string) => void;

  /** A function used to store a user's pre-authentication token in the `storage` object */
  putXQPreAuthToken: (user: string, preAuthToken: string) => void;

  /** A function used to remove a user's access to the dashboard by removing their associated key from the `storage` object */
  removeDashboardAccess: (user: string) => void;

  /** A function used to remove a user's profile by removing their associated key from the `storage` object */
  removeProfile: (user: string) => void;

  /** A function used to remove a user's general XQ access by removing their associated key from the `storage` object */
  removeXQAccess: (user: string) => void;

  /** A function used to remove a user's XQ pre-authentication token by removing their associated key from the `storage` object */
  removeXQPreAuthToken: (user: string) => void;

  /** The local storage object */
  storage: Storage;

  /**
   * @param {Storage} storage
   */
  constructor(storage: Storage) {
    if (!("caches" in window)) {
      console.error("no cache mechanism");
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
      if (!preAuthToken) {
        return null;
      }
      return preAuthToken;
    };

    this.removeXQPreAuthToken = (user) => {
      const xqPreAuthToken = this.getXQPreAuthToken(user);
      if (xqPreAuthToken != null) {
        this.storage.removeItem(this.makeExchangeKey(user));
      }
    };

    this.putXQAccess = (user, accessToken) => {
      this.storage.setItem(this.makeXQAccessKey(user), accessToken);
    };

    this.getXQAccess = (user, required) => {
      const accessToken = this.storage.getItem(this.makeXQAccessKey(user));
      if (required && !accessToken) {
        throw new StatusException(401, "401 Unauthorized");
      } else {
        return accessToken as string;
      }
    };

    this.removeXQAccess = (user) => {
      const accessToken = this.getXQAccess(user);
      if (accessToken) {
        this.storage.removeItem(this.makeXQAccessKey(user));

        return new ServerResponse(
          ServerResponse.ERROR,
          200,
          "Success. Removed XQ access."
        );
      }
    };

    this.putDashboardAccess = (user, accessToken) => {
      this.storage.setItem(this.makeDashboardAccessKey(user), accessToken);
    };

    this.getDashboardAccess = (user, required = false) => {
      const dashboardAccessToken = this.storage.getItem(
        this.makeDashboardAccessKey(user)
      );
      if (required && !dashboardAccessToken) {
        throw new StatusException(401, "401 Unauthorized");
      } else {
        return dashboardAccessToken as string;
      }
    };

    this.removeDashboardAccess = (user) => {
      const dashboardAccessToken = this.getDashboardAccess(user);
      if (dashboardAccessToken) {
        this.storage.removeItem(this.makeDashboardAccessKey(user));

        return new ServerResponse(
          ServerResponse.ERROR,
          200,
          "Success. Removed Dashboard access."
        );
      }
    };

    this.hasProfile = (user) => {
      const availableProfiles = this.listProfiles();

      return availableProfiles.includes(user);
    };

    this.putActiveProfile = (user) => {
      const self = this;
      const availableProfiles = this.listProfiles();
      if (availableProfiles.length == 0) {
        self.storage.setItem(this.PROFILE_LIST_KEY, JSON.stringify([user]));
      } else {
        if (!availableProfiles.includes(user)) {
          availableProfiles.push(user);
          const merged = availableProfiles.join(",");
          self.storage.setItem(this.PROFILE_LIST_KEY, merged);
        }
      }
      this.storage.setItem(this.ACTIVE_PROFILE_KEY, user);
    };

    this.putProfile = (user) => {
      const availableProfiles = this.listProfiles();
      if (availableProfiles.length == 0) {
        this.storage.setItem(this.PROFILE_LIST_KEY, user);
      } else {
        availableProfiles.push(user);
        const merged = availableProfiles.join(",");
        this.storage.setItem(this.PROFILE_LIST_KEY, merged);
      }

      if (this.getActiveProfile(false) == null) {
        this.storage.setItem(this.ACTIVE_PROFILE_KEY, user);
      }
    };

    this.getActiveProfile = (required) => {
      const activeProfile = this.storage.getItem(this.ACTIVE_PROFILE_KEY);

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
      const profilesSansUser = availableProfiles.filter(
        (profile) => profile != user
      );
      this.storage.setItem(
        this.PROFILE_LIST_KEY,
        JSON.stringify(profilesSansUser)
      );
      this.removeXQPreAuthToken(user);
      this.removeXQAccess(user);
      this.removeDashboardAccess(user);
    };

    this.clearAllProfiles = () => {
      const availableProfiles = this.listProfiles();

      for (var i = 0; i < availableProfiles.length; i++) {
        const user = this.getActiveProfile(false);

        if (user) {
          this.removeXQPreAuthToken(user);
          this.removeXQAccess(user);
          this.removeDashboardAccess(user);
        }

        break;
      }
      this.storage.removeItem(this.ACTIVE_PROFILE_KEY);
      this.storage.removeItem(this.PROFILE_LIST_KEY);
    };

    this.listProfiles = () => {
      const profiles = this.storage.getItem(this.PROFILE_LIST_KEY);
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
