# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.14.4] - 2023-01-03

### Fixed

- Fix typos and add network warning

## [0.14.3] - 2022-12-29

### Add

- Add link to DeDust.io

## [0.14.2] - 2022-12-29

### Add

- Add link to CryptoGas.shop

## [0.14.1] - 2022-12-27

### Fixed

- Fix Ton Connect TonProof result

## [0.14.0] - 2022-12-18

### Add

- Ton Connect Authorization
- Ton Connect Send Transaction

## [0.13.1] - 2022-12-02

### Fixed

- Fixed jetton decimals count

## [0.13.0] - 2022-11-25

### Add

- Add webAuthn authorization

## [0.12.1] - 2022-11-21

### Add

- Add support onchain jetton data

### Fixed

- Update loading from ipfs

## [0.12.0] - 2022-10-29

### Fixed

- Fixed sending `boc` or `hex` payload via `ton_sendTransaction` method

## [0.11.0] - 2022-10-28

### Add

- Add `ton_requestWallets` method to return wallet publicKey and version with address
- Update application to track TON DNS NFTs

## [0.10.2] - 2022-10-23

### Changed

- Add option to return wallet public key for `ton_requestAccounts`
- Change link in settings

## [0.10.1] - 2022-10-21

### Fixed

- Fixed padding wallet address to `ton_sendTransaction` method

## [0.10.0] - 2022-10-21

### Changed

- Update web-sdk package

### Add

- Add to `ton_sendTransaction` method option to pass hex or boc payload

## [0.9.2] - 2022-10-19

### Changed

- Update background build processor
- Minor layout fix and optimisation

### Add

- Init background validation

## [0.9.1] - 2022-10-15

### Changed

- Update `ton_personalSing` notification
- Install web-sdk from npm registry

## [0.9.0] - 2022-10-08

### Changed

- Allow multiple notification
- Update and improve wallet layout
- Change `ton_personalSing` method

### Added

- Add `ton_deployContract` method to deploy smart contract

## [0.8.0] - 2022-10-02

### Changed

- Update `wallet_watchAsset` method to import NFT

### Added

- Add NFT list on home page
- Add NFT page with transfer feature and import by NFT contract address features
- Add TON Proxy and TON Sites

## [0.7.1] - 2022-09-25

### Fixed

- Fix jettons navigation
- Fix redirects on change network

## [0.7.0] - 2022-09-25

### Added

- Add `ton_rawSing` method and notification view
- Add `ton_personalSing` method and notification view
- Add `wallet_watchAsset` method and notification view
- Add Jetton list on home page
- Add Jetton page with send feature and import by minter contract address features

## [0.6.1] - 2022-09-17

### Added

- QR code on Receive page

### Changed

- Update libs version
- Optimise build, remove unnecessary dependencies

## [0.6.0] - 2022-09-10

### Added

- Update wallet permissions. Added Locked permission, to allow dApps read base information from locked wallet

### Changed

- Fixing layout issue and formalizing ton value issue
- Make narrowest extension permissions

## [0.5.0] - 2022-09-07

### Added

- A key vault for multiple wallets
- Switch TON mainnet/testnet in one click
- Sending zero-commission transactions (only network fee) from the application
- Support TON DNS
- Inpage TON provider
  - Read addresses and balances, suggest transactions
  - Manage network
- DApps whitelist with permissions
- Fiat balance, activity list
- Wallets settings to manage version and bounceable address type

[unreleased]: https://github.com/OpenProduct/openmask-extension/compare/v0.14.4...HEAD
[0.14.4]: https://github.com/OpenProduct/openmask-extension/compare/v0.14.3...v0.14.4
[0.14.3]: https://github.com/OpenProduct/openmask-extension/compare/v0.14.2...v0.14.3
[0.14.2]: https://github.com/OpenProduct/openmask-extension/compare/v0.14.1...v0.14.2
[0.14.1]: https://github.com/OpenProduct/openmask-extension/compare/v0.14.0...v0.14.1
[0.14.0]: https://github.com/OpenProduct/openmask-extension/compare/v0.13.1...v0.14.0
[0.13.1]: https://github.com/OpenProduct/openmask-extension/compare/v0.13.0...v0.13.1
[0.13.0]: https://github.com/OpenProduct/openmask-extension/compare/v0.12.1...v0.13.0
[0.12.1]: https://github.com/OpenProduct/openmask-extension/compare/v0.12.0...v0.12.1
[0.12.0]: https://github.com/OpenProduct/openmask-extension/compare/v0.11.0...v0.12.0
[0.11.0]: https://github.com/OpenProduct/openmask-extension/compare/v0.10.2...v0.11.0
[0.10.2]: https://github.com/OpenProduct/openmask-extension/compare/v0.10.1...v0.10.2
[0.10.1]: https://github.com/OpenProduct/openmask-extension/compare/v0.10.0...v0.10.1
[0.10.0]: https://github.com/OpenProduct/openmask-extension/compare/v0.9.2...v0.10.0
[0.9.2]: https://github.com/OpenProduct/openmask-extension/compare/v0.9.1...v0.9.2
[0.9.1]: https://github.com/OpenProduct/openmask-extension/compare/v0.9.0...v0.9.1
[0.9.0]: https://github.com/OpenProduct/openmask-extension/compare/v0.8.0...v0.9.0
[0.8.0]: https://github.com/OpenProduct/openmask-extension/compare/v0.7.1...v0.8.0
[0.7.1]: https://github.com/OpenProduct/openmask-extension/compare/v0.7.0...v0.7.1
[0.7.0]: https://github.com/OpenProduct/openmask-extension/compare/v0.6.1...v0.7.0
[0.6.1]: https://github.com/OpenProduct/openmask-extension/compare/v0.6.0...v0.6.1
[0.6.0]: https://github.com/OpenProduct/openmask-extension/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/OpenProduct/openmask-extension/releases/tag/v0.5.0
