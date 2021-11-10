# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [1.0.26] - 2021-11-09

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
