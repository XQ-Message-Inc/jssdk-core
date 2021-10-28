# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [1.0.24] - 2020-10-28

### Added

- Expose `FetchQuantumEntropy` via SDK exported API

## [1.0.22] - 2020-10-27

### Modified

- `AuthorizeAlias` -- `putActiveProfile` added after successful `AuthorizeAlias` call. Without this present, a user will be considered unauthorized and receive `401` errors regardless of payload validity

## [1.0.20] - 2020-10-26

### Added

- `CHANGELOG.md` for better visibility between versions
