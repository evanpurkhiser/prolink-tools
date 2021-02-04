# Changelog

All notable changes to Prolink Tools will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- 🔌 **Multiple Network Interfaces**

  You may now use multiple network interfaces (such as a USB ethernet
  adapter + WiFi) without Prolink Tools being unable to fully connect to
  devices on the network.

- 🌑 **Dark Mode**

  A new **Dark Mode** has been added! You may now select the appropriate
  visual theme in the settings menu, or select 'System' to match your OS's
  theme!

- ⚡️ **Cloud Mode**

  A new experimental **Cloud Mode** has been added.

  Cloud mode allows Prolink Tools to connect to and publish your device events
  to a central server. This feature is the foundation for enabling features
  such as live track voting, live updating tracklists viewable by anyone,
  webhooks, developer APIs, chat-bots, and more.

  This feature is currently disabled by default. You will need to enable it in
  your settings to 

  Currently the only feature this enables is allowing you to access your
  overlay URLs from any computer without needing to munge the IP address.

  When using this feature your data will never be used in any way without your
  explicit permission.

- 📒 **Release Notes**

  Release notes may now be viewed when a new version is avaiable and will be
  shown after you install the new version!

### Fixed

- The 'Waiting for devices' screen will re-appear when all devices have been
  disconnected.

- Many internal changes have been made to support improved development speed.
  None of these changes will affect the functionality of Prolink Tools, though
  performance may be slightly better.

## [v0.1.0-beta.3] - 2021-01-03

### Added

- This is the start of the changelog. All previous changelogs are available to
  view from the [GitHub
  releases](https://github.com/EvanPurkhiser/prolink-tools/releases) for the
  project.

[Unreleased]: https://github.com/evanpurkhiser/prolink-tools/compare/v0.1.0-beta.3...HEAD
[v0.1.0-beta.3]: https://github.com/evanpurkhiser/prolink-tools/compare/v0.1.0-beta.2...v0.1.0-beta.3
