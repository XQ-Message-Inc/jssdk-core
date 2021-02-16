import StatusException from "../exceptions/StatusException.js";


export default class XQSimpleCache {
    /**
     *
     * @param {Storage} storage
     */
    constructor(storage) {

        if (!'caches' in window) {
            prompt("no cache mechanism")
        }
        this.storage = storage;
        this.XQ_PREFIX = "xq";
        this.EXCHANGE_PREFIX = "exchange";
        this.PROFILE_LIST_KEY = "available-profiles";
        this.ACTIVE_PROFILE_KEY = "active-profile";

    }

    putXQPreAuthToken = function (user, preAuthToken) {
        this.storage.setItem(this.makeExchangeKey(user), preAuthToken);
    }

    getXQPreAuthToken = function (user) {
        const preAuthToken = this.storage.getItem(this.makeExchangeKey(user));
        if (preAuthToken == undefined) {
            return null;
        }
        return preAuthToken;
    }

    removeXQPreAuthToken = function (user) {
        let xqPreAuthToken = this.getXQPreAuthToken(user);
        if (xqPreAuthToken != null) {
            this.storage.removeItem(this.makeExchangeKey(user));
        }
    }

    putXQAccess = function (user, accessToken) {
        this.storage.setItem(this.makeAccessKey(user), accessToken);
    }

    getXQAccess = function (user, required) {
        const accessToken = this.storage.getItem(this.makeAccessKey(user));
        if (required && accessToken == undefined) {
            throw new StatusException(401, "401 Unauthorized");
        } else {
            return accessToken;
        }
    }

    removeXQAccess = function (user) {
        let accessToken = this.getXQAccess(user);
        if (accessToken != null) {
            let success = this.storage.removeItem(this.makeAccessKey(user));
        }
    }

    hasProfile = function (user) {
        const availableProfiles = this.listProfiles();

        return availableProfiles.includes(user);
    }

    putActiveProfile = function (user) {
        let self = this;
        let availableProfiles = this.listProfiles();
        if (availableProfiles.length == 0) {
            self.storage.setItem(this.PROFILE_LIST_KEY, user);
        } else {
            if(!availableProfiles.includes(user)) {
                availableProfiles.push(user);
                let merged = availableProfiles.join(",");
                self.storage.setItem(this.PROFILE_LIST_KEY, merged);
            }
        }
        this.storage.setItem(this.ACTIVE_PROFILE_KEY, user)
    }

    putProfile = function (user) {
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
    }

    getActiveProfile = function (required) {

        let activeProfile = this.storage.getItem(this.ACTIVE_PROFILE_KEY);

        if (required && activeProfile == null) {
            throw new StatusException(401, "401 Unauthorized");
        } else {
            if (activeProfile == null) {
                return null;
            }
            return activeProfile;
        }
    }

    removeProfile = function (user) {
        const availableProfiles = this.listProfiles();
        let profilesSansUser = availableProfiles.filter(profile => profile != user);
        this.storage.setItem(this.PROFILE_LIST_KEY, profilesSansUser);
        this.removeXQPreAuthToken(user);
        this.removeXQAccess(user);


    }

    clearAllProfiles = function () {
        let availableProfiles = this.listProfiles();

            for (var i = 0; i < availableProfiles.length; i++) {
                let user = this.getActiveProfile(false);

                this.removeXQPreAuthToken(user);
                this.removeXQAccess(user);
                break;
            }
            this.storage.removeItem(this.ACTIVE_PROFILE_KEY);
            this.storage.removeItem(this.PROFILE_LIST_KEY);
        }

    /**
     * @returns {[]} profiles
     */
    listProfiles = function () {
        let profiles  = this.storage.getItem(this.PROFILE_LIST_KEY);
        if(profiles!=null){
            return profiles.split(",");
        }else{
            return [];
        }
    }

    makeExchangeKey = function (unvalidatedUser) {
        return `${this.EXCHANGE_PREFIX}-${this.XQ_PREFIX}-${unvalidatedUser}`
    }
    makeAccessKey = function (validatedUser) {
        return `${this.XQ_PREFIX}-${validatedUser}`
    }



}
