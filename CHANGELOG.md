# Changelog

All notable changes to Prolink Tools will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Added "Follow master" to timing settings** 🟠

  You may now select 'Follow master' to have now playing updates only happen
  when the player is promoted to Master. This may be useful if you want more
  fine grained control over when your track is shown.

### Changed

- Now playing timing options have been restructured to now have 3 "modes".
  Previously the "smart timing" mode was implicitly enabled, and turning on
  "only report after last track ends" would disable it.

  Each mode is now explicitly an option that you may only select one of.

### Fixed

- Cloud Mode should now be more stable and will not intermittently lose
  connection.

- Player ID 7 is now used for the 'Virtual CDJ' that Prolink Tools acts as on
  the network, no longer taking up slot 5. You can now use Player ID 5 with
  your CDJ-3000s without a problem!

- The <em>A State of Overlays</em> theme no longer has the italics bracket
  partially cutoff to the left.

- Overlays will no longer produce scroll bars when the title overflows the
  window size. (Thank you to Marcus from Da Tweekaz for reporting this issue)

## [v0.1.0-beta.5] - 2021-02-11

### Added

- **Configure now playing timings** ⏲

  You can now configure the number of beats Prolink Tools will wait before
  reporting a track. Useful when you're not playing genres with 2 phrases of
  intro, which is the default timing.

  Various other configurations have been introduced to control timing of
  now-playing track changes.

  **[IMPORTANT]:** If you are using a setup with devices which do not report
  On-Air status (such as the CDJ-2000s or an older DJM) older versions of
  Prolink Tools would automatically enable the _only report after last track
  ends_ configuration. This is now a manually toggled option.

- **Dark Mode** 🌑

  A new **Dark Mode** has been added! You may now select the appropriate
  visual theme in the settings menu, or select 'System' to match your OS's
  theme!

- **Cloud Mode** ⚡️

  A new experimental **Cloud Mode** has been added.

  Cloud mode allows Prolink Tools to connect to and publish your device events
  to a central server. This feature is the foundation for enabling features
  such as live track voting, live updating tracklists viewable by anyone,
  webhooks, developer APIs, chat-bots, and more.

  This feature is currently disabled by default. You will need to enable it in
  your settings to

  Currently the only feature this enables is allowing you to access your
  overlay URLs from any computer without needing to munge the IP address.

  When using this feature your data will never be used in any way without your explicit permission.

- **Release Notes** 📒

  Release notes may now be viewed when a new version is avaiable and will be
  shown after you install the new version!

### Fixed

- **Multiple Network Interfaces** 🔌

  You may now use multiple network interfaces (such as a USB ethernet
  adapter + WiFi) without Prolink Tools being unable to fully connect to
  devices on the network.

- The 'Waiting for devices' screen will re-appear when all devices have been
  disconnected.

- Many internal changes have been made to support improved development speed.
  None of these changes will affect the functionality of Prolink Tools, though
  performance may be slightly better.

## [v0.1.0-beta.3] - 2021-01-03

### Added

- This is the start of the changelog. All previous changelogs are available to
  view from the [GitHub
  releases](https://github.com/evanpurkhiser/prolink-tools/releases) for the
  project.

[unreleased]: https://github.com/evanpurkhiser/prolink-tools/compare/v0.1.0-beta.5...HEAD
[v0.1.0-beta.5]: https://github.com/evanpurkhiser/prolink-tools/compare/v0.1.0-beta.3...v0.1.0-beta.5
[v0.1.0-beta.3]: https://github.com/evanpurkhiser/prolink-tools/compare/v0.1.0-beta.2...v0.1.0-beta.3
