# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[unreleased]: https://github.com/OpenProduct/openmask-extension/compare/v0.9.2...HEAD
[0.9.2]: https://github.com/OpenProduct/openmask-extension/compare/v0.9.1...v0.9.2
[0.9.1]: https://github.com/OpenProduct/openmask-extension/compare/v0.9.0...v0.9.1
[0.9.0]: https://github.com/OpenProduct/openmask-extension/compare/v0.8.0...v0.9.0
[0.8.0]: https://github.com/OpenProduct/openmask-extension/compare/v0.7.1...v0.8.0
[0.7.1]: https://github.com/OpenProduct/openmask-extension/compare/v0.7.0...v0.7.1
[0.7.0]: https://github.com/OpenProduct/openmask-extension/compare/v0.6.1...v0.7.0
[0.6.1]: https://github.com/OpenProduct/openmask-extension/compare/v0.6.0...v0.6.1
[0.6.0]: https://github.com/OpenProduct/openmask-extension/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/OpenProduct/openmask-extension/releases/tag/v0.5.0
