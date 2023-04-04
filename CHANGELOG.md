# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.18.5] - 2023-04-04

### Fixed

- Update dApps connection

## [0.18.4] - 2023-04-01

### Fixed

- Fixed asset list
- Format jetton decimals

## [0.18.3] - 2023-03-30

### Add

- Support On chain Content for NFT

## [0.18.2] - 2023-03-23

### Fixed

- Update transactions view and handle Ledger exceptions

## [0.18.1] - 2023-03-20

### Fixed

- Fixed create wallet from scratch flow

## [0.18.0] - 2023-03-18

### Add

- Ledger Hardwart Wallet Support
- Update wallet to work with ton-core

## [0.17.6] - 2023-03-09

### Changed

- Update index page layout

## [0.17.5] - 2023-03-01

### Add

- Jetton validation

## [0.17.4] - 2023-02-27

### Fixed

- Layout fixes

## [0.17.3] - 2023-02-18

### Fixed

- isBounceable flag base address string

## [0.17.2] - 2023-02-18

### Add

- Send multiple transaction via Ton Connect

## [0.17.1] - 2023-02-14

### Fixed

- Disable proxy configuration on background start

## [0.17.0] - 2023-02-09

### Add

- Editable network configuration

## [0.16.3] - 2023-02-09

### Add

- Add Wallet info to TonConnect Provider

## [0.16.2] - 2023-01-28

### Fixed

- Display errors for invalid notification data

## [0.16.1] - 2023-01-28

### Add

- Add link to tegro.finance

## [0.16.0] - 2023-01-25

### Add

- E2E encrypted messages

## [0.15.2] - 2023-01-23

### Fixed

- Amount in number for TonConnect;

## [0.15.1] - 2023-01-18

### Fixed

- Fix ton provider concurrent with ton wallet

## [0.15.0] - 2023-01-17

### Add

- Add `ton_decryptMessage` and `ton_encryptMessage` methods and notification views

### Fixed

- Bug with connection and empty connection list

## [0.14.8] - 2023-01-15

### Fixed

- Show mnemonic view for webauthn auth

## [0.14.7] - 2023-01-13

### Add

- Add jetton fiat amount from DeDust.io

### Fixed

- Fixed loading jetton state

## [0.14.6] - 2023-01-06

### Fixed

- Update TonConnect 2.0 - reconnect method and device detection
- Update provider to not destroy provider by other wallets

## [0.14.5] - 2023-01-04

### Fixed

- Update TonConnect 2.0 - reconnect method

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

[unreleased]: https://github.com/OpenProduct/openmask-extension/compare/v0.18.3...HEAD
[0.18.2]: https://github.com/OpenProduct/openmask-extension/compare/v0.18.2...v0.18.3
[0.18.2]: https://github.com/OpenProduct/openmask-extension/compare/v0.18.1...v0.18.2
[0.18.1]: https://github.com/OpenProduct/openmask-extension/compare/v0.18.0...v0.18.1
[0.18.0]: https://github.com/OpenProduct/openmask-extension/compare/v0.17.6...v0.18.0
[0.17.6]: https://github.com/OpenProduct/openmask-extension/compare/v0.17.5...v0.17.6
[0.17.5]: https://github.com/OpenProduct/openmask-extension/compare/v0.17.4...v0.17.5
[0.17.4]: https://github.com/OpenProduct/openmask-extension/compare/v0.17.3...v0.17.4
[0.17.3]: https://github.com/OpenProduct/openmask-extension/compare/v0.17.2...v0.17.3
[0.17.2]: https://github.com/OpenProduct/openmask-extension/compare/v0.17.1...v0.17.2
[0.17.1]: https://github.com/OpenProduct/openmask-extension/compare/v0.17.0...v0.17.1
[0.17.0]: https://github.com/OpenProduct/openmask-extension/compare/v0.16.3...v0.17.0
[0.16.3]: https://github.com/OpenProduct/openmask-extension/compare/v0.16.2...v0.16.3
[0.16.2]: https://github.com/OpenProduct/openmask-extension/compare/v0.16.1...v0.16.2
[0.16.1]: https://github.com/OpenProduct/openmask-extension/compare/v0.16.0...v0.16.1
[0.16.0]: https://github.com/OpenProduct/openmask-extension/compare/v0.15.2...v0.16.0
[0.15.2]: https://github.com/OpenProduct/openmask-extension/compare/v0.15.1...v0.15.2
[0.15.1]: https://github.com/OpenProduct/openmask-extension/compare/v0.15.0...v0.15.1
[0.15.0]: https://github.com/OpenProduct/openmask-extension/compare/v0.14.8...v0.15.0
[0.14.8]: https://github.com/OpenProduct/openmask-extension/compare/v0.14.7...v0.14.8
[0.14.7]: https://github.com/OpenProduct/openmask-extension/compare/v0.14.6...v0.14.7
[0.14.6]: https://github.com/OpenProduct/openmask-extension/compare/v0.14.5...v0.14.6
[0.14.5]: https://github.com/OpenProduct/openmask-extension/compare/v0.14.4...v0.14.5
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
