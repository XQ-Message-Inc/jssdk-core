# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [1.6.0] - 2022-04-18

### Addition
- Add CRUD operations for businesses, including `AddBusiness`, `GetCurrentBusiness`, and `UpdateBusiness`.

- Add CRUD operations for applications, including `AddApplication`, `RemoveApplication`, and `UpdateApplication`.
### Modified

- Update the `README.md` documentation file to reflect recent changes to the sdk.

## [1.5.3] - 2022-04-18
### Modified

- Update `Authorize` params to include `text` and `target`. `text` is an interpolated text field when a mobile number is specified. Use $pin to interpolate the pin or $link to interpolate the maybePayLoad.target. `target` is A link that can be interpolated in the maybePayload.text. Used for inviting users by text
## [1.5.1] - 2022-03-28
### Modified

- Update `RevokeKeyAccess` expected params of `locatorKey` --> `locatorKeys`, a `string` --> `string[]`
- Update `call` method of XQSDK to include check from DELETE http method when factoring in `maybePayload` presence

## [1.5.0] 2022-03-24
## Addition
- Add `GetEventLogs`, `GetCommunications`, `GetEventTypes` services to return a payloads containing event logs, communications, and event types - respectively.

## [1.4.0] 2022-03-22
## Addition
- Add `GetBusinesses` service to return a payload containing an array of businesses related to a user's dashboard


## [1.3.2] 2022-03-22
## Modified
- Modify `VerifyAccount` and `DashboardLogin` services to return a payload that includes a `dashboardAccessToken` and `user` (email/ID)
- Modify `VerifyAccount` to take optional full dashboard access token, rather than just a pre-auth dashboard access token
## [1.3.0] 2022-03-21

## Added
- Add `VerifyAccount`, `GetCurrentUser`, `GetContacts`, and `GetSubscriberInfo` services

## Modified
- Modify `DashboardLogin` service
## Removed
- Remove `FindContacts` service

## [1.2.4] 2022-03-02

## Modified
- Modify services to use correct `CallMethod` (instead of `CallMethod.OPTIONS`):
* `GrantUserAccess` => POST
* `RevokeKeyAccess` => DELETE
* `RevokeUserAccess` => PATCH
* `UpdateSettings` => PATCH


## [1.2.1] - 2022-02-13

## Modified
- update `RevokeKeyAccess` service `CallMethod` to utilize `DELETE` instead of `OPTIONS`

## [1.2.0] - 2022-02-03

## Modified
- update `Encrypt`, `FileEncrypt`, and `GeneratePacket` to accept `type` and `meta` field values in payload

## [1.1.4] - 2021-12-30

## Modified
- update `Authorize` service to put access using an already existing, but valid, `accessToken`

## [1.1.3] - 2021-11-30

## Modified
- update repository URL, bugs URL, and homepage in package.json to reflect new github repo

## [1.1.2] - 2021-11-29
## Modified
- update `Encrypt` and `OTPv2Encryption` methods to allow users to bypass the key expansion method for user-generated keys.

## [1.1.1] - 2021-11-19
## Added
- Allow dynamic server URL configuration. Added new param to constructor of `XQSDK`, `serverConfig`, which allows the user to specific the `DASHBOARD_SERVER_URL`, `KEY_SERVER_URL`, `SUBSCRIPTION_SERVER_URL`, `VALIDATION_SERVER_URL` for their application.
- Inline documentation for `universalBtoa` and `universalAtob` in `OTPv2Encryption.ts`

## [1.1.0] - 2021-11-15

## Added
- Compatibility w/ server-side environments (node.js).

We replaced purely web based APIs such as `Buffer`, `localStorage`, and `XMLHttpRequest` with nearly identical versions that are compatitble within server-side environments. The packages and their versions are listed here:
```
 "buffer": "^6.0.3",
 "memory-cache": "^0.2.0",
 "xhr2": "^0.2.1"
```

Utilizing `memory-cache` in lieu of `localStorage` required a few syntactic updates, mainly method names. `buffer` and `xhr2` were plug-and-play and replaced the web based variants just fine.

## Tested
- New compatibility updates via a web based playground application (react), a node/express server plaground as well as the `jssdk-examples` application.


## [1.0.27] - 2021-11-09

### Modified
- return type of `FileEncrypt.supplyAsync` from `void` --> `Promise<ServerResponse>`
- return type of `locateFn`, the second parameter of `OTPv2Encryption.decryptFile`, a callback used to fetch the locator key of a given source file. From `string` --> `Promise<string>`
- return type of `OTPv2Encryption.decryptFile` from `void` --> `Promise<unknown>`
- refactor `OTPv2Encryption.parseFileForDecrypt` method, same results.
- return type of `locateFn`, the second parameter of `EncryptionAlgorithm.decryptFile`, a callback used to fetch the locator key of a given source file. From `Record<string, string>` --> `Promise<string>`. The superclass' method should match the `OTPv2Encryption` variant method.

## [1.0.26] - 2021-11-09

### Modified

- `FileDecrypt` - update the type of the algorithm parameter of the `FileDecrypt` constructor to the `EncryptionAlgorithm` super class, rather than an omitted/stripped down version of the type. Also update return type from `void` --> `Promise<ServerResponse>` which is the correct return type.


Constructor param type - The second argument of the FileDecrypt constructor expects an EncryptionAlgorithm, essentially a class for either OTPv2 or AES. I for some reason set it to a stripped down local type expecting one method.
Return value type - the return value was set to a type called void, which all it means is that nothing of note is returned, typically a console log or something along those lines. I set the type to expect a ServerResponse which is the correct return type.

## [1.0.25] - 2021-10-29

### Added

- `publish` script to `package.json` -- runs `yarn build` then `npm publish --access public` to ensure we build out our latest updates before publishing to NPM

### Modified

- naming of the `OPTV2` variable back to standardized `OTPv2`

## [1.0.24] - 2021-10-28

### Added

- Expose `FetchQuantumEntropy` via SDK exported API

## [1.0.22] - 2021-10-27

### Modified

- `AuthorizeAlias` -- `putActiveProfile` added after successful `AuthorizeAlias` call. Without this present, a user will be considered unauthorized and receive `401` errors regardless of payload validity

## [1.0.20] - 2021-10-26

### Added

- `CHANGELOG.md` for better visibility between versions
