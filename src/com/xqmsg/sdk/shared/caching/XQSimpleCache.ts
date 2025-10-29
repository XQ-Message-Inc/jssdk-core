import { CacheClass } from "memory-cache";
import ServerResponse from "../ServerResponse";
import StatusException from "../exceptions/StatusException";

/**
 * @class [XQSimpleCache]
 */
export default class XQSimpleCache {
  /** The field name for `storage` object representing the current active profile */
  ACTIVE_PROFILE_KEY = "active-profile";

  /** The prefix used for the dashboard application used in the `makeDashboardAccessKey` method. The prefix is prepended to the `user` and the result is used as a field name for the `storage` object */
  DASHBOARD_PREFIX = "dashboard";

  /** A prefix used for the dashboard application used in the `makeXQAccessKey` method. The prefix is prepended to the `XQ_PREFIX` and `user` string and the result is used as a field name for the `storage` object */
  EXCHANGE_PREFIX = "exchange";

  /** The field name for `storage` object representing the lists of available profiles */
  AVAILABLE_PROFILES_KEY = "available-profiles";

  /** A prefix for xq used in various field names for the `storage` object */
  XQ_PREFIX = "xq";

  /** A prefix used for the Delta API v3 */
  DELTA_PREFIX = "delta";

  /** A function which removes all profiles from the `storage` object */
  clearAllProfiles: () => void;

  /** A function which retrieves the active profile from the `storage` object */
  getActiveProfile: (required: boolean) => string | null;

  /** A function which is used to request dashboard access */
  getDashboardAccess: (
    user: string,
    required?: boolean
  ) => StatusException | string;

  /** A function which is used to request Delta API access token */
  getDeltaAccess: (user: string, required?: boolean) => StatusException | string;

  /** A function which is used to request Delta API guest access token */
  getDeltaGuestAccess: (required?: boolean) => string | null;

  /** A function which is used to request Delta API login code */
  getDeltaLoginCode: () => string | null;

  /** A function which is used to request Delta API refresh code */
  getDeltaRefreshCode: (user: string) => string | null;

  /** A function which is used to request Delta API token expiration */
  getDeltaTokenExpiration: (user: string) => string | null;

  /** A function which is used to retrieve the selected Delta API team identifier */
  getDeltaTeamId: (user: string) => string | null;

  /** A function which is used to request general XQ access */
  getXQAccess: (user: string, required?: boolean) => StatusException | string;

  /** A function which is used to request an XQ pre-authentication token */
  getXQPreAuthToken: () => string | null;

  /** A function which is used to find if the requested user has a profile in the available profiles stored in the `storage` object */
  hasProfile: (user: string) => boolean;

  /** A function used to list all available profiles stored in the `storage` object */
  listProfiles: () => string[];

  /** A function used to create a dashboard access key for a given user */
  makeDashboardAccessKey: (user: string) => string;

  /** A function used to create a Delta access key for a given user */
  makeDeltaAccessKey: (user: string) => string;

  /** A function used to create a Delta guest access key */
  makeDeltaGuestAccessKey: () => string;

  /** A function used to create a Delta login code key */
  makeDeltaLoginCodeKey: () => string;

  /** A function used to create a Delta refresh code key for a given user */
  makeDeltaRefreshCodeKey: (user: string) => string;

  /** A function used to create a Delta token expiration key for a given user */
  makeDeltaTokenExpirationKey: (user: string) => string;

  /** A function used to create a Delta team identifier key for a given user */
  makeDeltaTeamIdKey: (user: string) => string;

  /** A function used to create a exchange access key for a given user */
  makeExchangeKey: () => string;

  /** A function used to create an XQ access key for a given user */
  makeXQAccessKey: (user: string) => string;

  /** A function used to store a user as an active profile in the `storage` object */
  putActiveProfile: (user: string) => void;

  /** A function used to grant a user dashboard access using an associated key and storing it in the `storage` object */
  putDashboardAccess: (user: string, accessToken: string) => void;

  /** A function used to grant a user Delta API access using an associated key and storing it in the `storage` object */
  putDeltaAccess: (user: string, accessToken: string) => void;

  /** A function used to store Delta API guest access token in the `storage` object */
  putDeltaGuestAccess: (guestAccessToken: string) => void;

  /** A function used to store Delta API login code in the `storage` object */
  putDeltaLoginCode: (code: string) => void;

  /** A function used to store Delta API refresh code for a user in the `storage` object */
  putDeltaRefreshCode: (user: string, refreshCode: string) => void;

  /** A function used to store Delta API token expiration for a user in the `storage` object */
  putDeltaTokenExpiration: (user: string, expiration: string) => void;

  /** A function used to store the selected Delta API team identifier */
  putDeltaTeamId: (user: string, teamId: string) => void;

  /** A function used to store a user's profile in the `storage` object */
  putPreAuthProfile: (user: string) => void;

  /** A function used to grant a user general XQ access */
  putXQAccess: (user: string, accessToken: string) => void;

  /** A function used to store a user's pre-authentication token in the `storage` object */
  putXQPreAuthToken: (user: string, preAuthToken: string) => void;

  /** A function used to remove a user's access to the dashboard by removing their associated key from the `storage` object */
  removeDashboardAccess: (user: string) => void;

  /** A function used to remove a user's Delta API access by removing their associated key from the `storage` object */
  removeDeltaAccess: (user: string) => void;

  /** A function used to remove Delta API guest access token from the `storage` object */
  removeDeltaGuestAccess: () => void;

  /** A function used to remove Delta API login code from the `storage` object */
  removeDeltaLoginCode: () => void;

  /** A function used to remove Delta API refresh code for a user from the `storage` object */
  removeDeltaRefreshCode: (user: string) => void;

  /** A function used to remove Delta API token expiration for a user from the `storage` object */
  removeDeltaTokenExpiration: (user: string) => void;

  /** A function used to remove the selected Delta API team identifier */
  removeDeltaTeamId: (user: string) => void;

  /** A function used to remove a user's profile by removing their associated key from the `storage` object */
  removeProfile: (user: string) => void;

  /** A function used to remove a user's general XQ access by removing their associated key from the `storage` object */
  removeXQAccess: (user: string) => void;

  /** A function used to remove a user's XQ pre-authentication token by removing their associated key from the `storage` object */
  removeXQPreAuthToken: () => void;

  /** The local storage object */
  storage: CacheClass<string, string>;

  /**
   * @param {CacheClass} storage
   */
  constructor(storage: CacheClass<string, string>) {
    this.storage = storage;
    this.XQ_PREFIX = "xq";
    this.DASHBOARD_PREFIX = "dashboard";
    this.DELTA_PREFIX = "delta";
    this.EXCHANGE_PREFIX = "exchange";
    this.AVAILABLE_PROFILES_KEY = "available-profiles";
    this.ACTIVE_PROFILE_KEY = "active-profile";

    this.putXQPreAuthToken = (preAuthToken) => {
      this.storage.put(this.makeExchangeKey(), preAuthToken);
    };

    this.getXQPreAuthToken = () => {
      const preAuthToken = this.storage.get(this.makeExchangeKey()) || null;
      return preAuthToken;
    };

    this.removeXQPreAuthToken = () => {
      const xqPreAuthToken = this.getXQPreAuthToken();
      if (xqPreAuthToken) {
        this.storage.del(this.makeExchangeKey());
      }
    };

    this.putXQAccess = (user, accessToken) => {
      this.storage.put(this.makeXQAccessKey(user), accessToken);
    };

    this.getXQAccess = (user, required) => {
      const accessToken = this.storage.get(this.makeXQAccessKey(user));
      if (required && !accessToken) {
        throw new StatusException(401, "401 Unauthorized");
      } else {
        return accessToken as string;
      }
    };

    this.removeXQAccess = (user) => {
      const accessToken = this.getXQAccess(user);
      if (accessToken) {
        this.storage.del(this.makeXQAccessKey(user));

        return new ServerResponse(
          ServerResponse.ERROR,
          200,
          "Success. Removed XQ access."
        );
      }
    };

    this.putDashboardAccess = (user, accessToken) => {
      this.storage.put(this.makeDashboardAccessKey(user), accessToken);
    };

    this.getDashboardAccess = (user, required = false) => {
      const dashboardAccessToken = this.storage.get(
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
        this.storage.del(this.makeDashboardAccessKey(user));

        return new ServerResponse(
          ServerResponse.ERROR,
          200,
          "Success. Removed Dashboard access."
        );
      }
    };

    // Delta API v3 cache methods
    this.putDeltaLoginCode = (code) => {
      this.storage.put(this.makeDeltaLoginCodeKey(), code);
    };

    this.getDeltaLoginCode = () => {
      const loginCode = this.storage.get(this.makeDeltaLoginCodeKey()) || null;
      return loginCode;
    };

    this.removeDeltaLoginCode = () => {
      const loginCode = this.getDeltaLoginCode();
      if (loginCode) {
        this.storage.del(this.makeDeltaLoginCodeKey());
      }
    };

    this.putDeltaGuestAccess = (guestAccessToken) => {
      this.storage.put(this.makeDeltaGuestAccessKey(), guestAccessToken);
    };

    this.getDeltaGuestAccess = (required = false) => {
      const guestAccessToken = this.storage.get(this.makeDeltaGuestAccessKey()) || null;
      if (required && !guestAccessToken) {
        throw new StatusException(401, "Delta guest access token not found");
      }
      return guestAccessToken;
    };

    this.removeDeltaGuestAccess = () => {
      const guestAccessToken = this.getDeltaGuestAccess();
      if (guestAccessToken) {
        this.storage.del(this.makeDeltaGuestAccessKey());
      }
    };

    this.putDeltaAccess = (user, accessToken) => {
      this.storage.put(this.makeDeltaAccessKey(user), accessToken);
    };

    this.getDeltaAccess = (user, required = false) => {
      const deltaAccessToken = this.storage.get(this.makeDeltaAccessKey(user));
      if (required && !deltaAccessToken) {
        throw new StatusException(401, "Delta access token not found");
      } else {
        return deltaAccessToken as string;
      }
    };

    this.removeDeltaAccess = (user) => {
      const deltaAccessToken = this.getDeltaAccess(user);
      if (deltaAccessToken) {
        this.storage.del(this.makeDeltaAccessKey(user));
        this.removeDeltaTeamId(user);

        return new ServerResponse(
          ServerResponse.ERROR,
          200,
          "Success. Removed Delta access."
        );
      }
    };

    this.putDeltaRefreshCode = (user, refreshCode) => {
      this.storage.put(this.makeDeltaRefreshCodeKey(user), refreshCode);
    };

    this.getDeltaRefreshCode = (user) => {
      const refreshCode = this.storage.get(this.makeDeltaRefreshCodeKey(user)) || null;
      return refreshCode;
    };

    this.removeDeltaRefreshCode = (user) => {
      const refreshCode = this.getDeltaRefreshCode(user);
      if (refreshCode) {
        this.storage.del(this.makeDeltaRefreshCodeKey(user));
      }
    };

    this.putDeltaTokenExpiration = (user, expiration) => {
      this.storage.put(this.makeDeltaTokenExpirationKey(user), expiration);
    };

    this.getDeltaTokenExpiration = (user) => {
      const expiration = this.storage.get(this.makeDeltaTokenExpirationKey(user)) || null;
      return expiration;
    };

    this.removeDeltaTokenExpiration = (user) => {
      const expiration = this.getDeltaTokenExpiration(user);
      if (expiration) {
        this.storage.del(this.makeDeltaTokenExpirationKey(user));
      }
    };

    this.putDeltaTeamId = (user, teamId) => {
      this.storage.put(this.makeDeltaTeamIdKey(user), teamId);
    };

    this.getDeltaTeamId = (user) => {
      const teamId = this.storage.get(this.makeDeltaTeamIdKey(user)) || null;
      return teamId;
    };

    this.removeDeltaTeamId = (user) => {
      const teamId = this.getDeltaTeamId(user);
      if (teamId) {
        this.storage.del(this.makeDeltaTeamIdKey(user));
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
        self.storage.put(this.AVAILABLE_PROFILES_KEY, user);
      } else {
        if (!availableProfiles.includes(user)) {
          availableProfiles.push(user);
          const merged = availableProfiles.join(",");
          self.storage.put(this.AVAILABLE_PROFILES_KEY, merged);
        }
      }
      this.storage.put(this.ACTIVE_PROFILE_KEY, user);
    };

    this.getActiveProfile = (required) => {
      const activeProfile = this.storage.get(this.ACTIVE_PROFILE_KEY);

      if (required && activeProfile == null) {
        throw new StatusException(401, "401 Unauthorized");
      } else {
        if (activeProfile == null) {
          return null;
        }
        return activeProfile;
      }
    };

    this.putPreAuthProfile = (user) => {
      const availableProfiles = this.listProfiles();
      if (availableProfiles.length == 0) {
        this.storage.put(this.AVAILABLE_PROFILES_KEY, user);
      } else {
        availableProfiles.push(user);
        const merged = availableProfiles.join(",");
        this.storage.put(this.AVAILABLE_PROFILES_KEY, merged);
      }

      if (this.getActiveProfile(false) == null) {
        this.storage.put(this.ACTIVE_PROFILE_KEY, user);
      }
    };

    this.removeProfile = (user) => {
      const availableProfiles = this.listProfiles();
      const profilesSansUser = availableProfiles.filter(
        (profile) => profile != user
      );
      this.storage.put(
        this.AVAILABLE_PROFILES_KEY,
        JSON.stringify(profilesSansUser)
      );
      this.removeXQPreAuthToken();
      this.removeXQAccess(user);
      this.removeDashboardAccess(user);
      this.removeDeltaAccess(user);
      this.removeDeltaRefreshCode(user);
      this.removeDeltaTokenExpiration(user);
      this.removeDeltaTeamId(user);
    };

    this.clearAllProfiles = () => {
      const availableProfiles = this.listProfiles();

      for (var i = 0; i < availableProfiles.length; i++) {
        const user = this.getActiveProfile(false);

        if (user) {
          this.removeXQPreAuthToken();
          this.removeXQAccess(user);
          this.removeDashboardAccess(user);
          this.removeDeltaAccess(user);
          this.removeDeltaRefreshCode(user);
          this.removeDeltaTokenExpiration(user);
          this.removeDeltaTeamId(user);
        }

        break;
      }
      this.removeDeltaLoginCode();
      this.removeDeltaGuestAccess();
      this.storage.del(this.ACTIVE_PROFILE_KEY);
      this.storage.del(this.AVAILABLE_PROFILES_KEY);
    };

    this.listProfiles = () => {
      const profiles = this.storage.get(this.AVAILABLE_PROFILES_KEY);
      if (profiles != null) {
        return profiles.split(",");
      } else {
        return [];
      }
    };

    this.makeExchangeKey = () => {
      return `${this.EXCHANGE_PREFIX}-${this.XQ_PREFIX}}`;
    };

    this.makeXQAccessKey = (validatedUser: string) => {
      return `${this.XQ_PREFIX}-${validatedUser}`;
    };

    this.makeDashboardAccessKey = (validatedUser: string) => {
      return `${this.DASHBOARD_PREFIX}-${validatedUser}`;
    };

    this.makeDeltaLoginCodeKey = () => {
      return `${this.DELTA_PREFIX}-login-code`;
    };

    this.makeDeltaGuestAccessKey = () => {
      return `${this.DELTA_PREFIX}-guest-access`;
    };

    this.makeDeltaAccessKey = (validatedUser: string) => {
      return `${this.DELTA_PREFIX}-${validatedUser}`;
    };

    this.makeDeltaRefreshCodeKey = (validatedUser: string) => {
      return `${this.DELTA_PREFIX}-refresh-${validatedUser}`;
    };

    this.makeDeltaTokenExpirationKey = (validatedUser: string) => {
      return `${this.DELTA_PREFIX}-expiration-${validatedUser}`;
    };

    this.makeDeltaTeamIdKey = (validatedUser: string) => {
      return `${this.DELTA_PREFIX}-team-${validatedUser}`;
    };
  }
}
