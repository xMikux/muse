# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.1.7] - 2022-09-19
### Fixed
- Bumped ytdl-core

## [2.1.6] - 2022-08-26
### Changed
- Now uses the `slim` variant of the official Node image to reduce image size by ~300 MB

## [2.1.5] - 2022-08-26
### Fixed
- Bumped ytdl-core

## [2.1.4] - 2022-08-19
### Fixed
- Switch from emso to [tsx](https://github.com/esbuild-kit/tsx) to fix ESM loader bug with recent Node.js versions
## [2.1.3] - 2022-08-08
### Fixed
- Cache files are now correctly created

## [2.1.2] - 2022-08-04
### Fixed
- Bot status is working again

### Changed
- Bumped dependencies

## [2.1.1] - 2022-07-16
### Fixed
- Retry refreshing Spotify access token if a request fails (should fix https://github.com/codetheweb/muse/issues/719)

## [2.1.0] - 2022-06-25
- `/loop` command that plays the current song on loop


## [2.0.4] - 2022-05-16
### Fixed
- Bad import

## [2.0.3] - 2022-05-15
### Changed
- Bumped dependencies
- Add tini to Docker image to reap zombie processes

## [2.0.2] - 2022-05-14
### Changed
- Fully remove `/config set-role`

## [2.0.1] - 2022-05-13
### Changed
- Fixed message sent on guild invite to better reflect new permission system

## [2.0.0] - 2022-05-13
### Changed
- Migrated to the v10 API
- Command permissions are now configured differently: you can now configure permissions in Discord's UI rather than through the bot. See the [wiki page](https://github.com/codetheweb/muse/wiki/Configuring-Bot-Permissions) for details.
- 🚨 when you upgrade to this version, the role you manually set with `/config set-role` will no longer be respected. Check the above link for how to re-configure permissions.

## [1.9.0] - 2022-04-23
### Changed
- `/move` command now shows the track that was moved and its position

### Fixed
- Fixed a case-sensitive import issue

### Added
- Added a `/next` alias for `/skip`

## [1.8.2] - 2022-03-27
### Fixed
- `/fseek` now works again

## [1.8.1] - 2022-03-26
### Changed
- Reduced image size

## [1.8.0] - 2022-03-24
### Added
- Added a configurable bot status with user defined activities
### Fixed
- Error messages consistently show as `🚫 ope: error`

## [1.7.0] - 2022-03-19
### Added
- Added a `/move` command to change position of tracks
- Added a `/now-playing` command to show the current track without the full queue embed

## [1.6.2] - 2022-03-17
### Fixed
- There are no longer FFMPEG orphan processes after listening to a livestream

## [1.6.1] - 2022-03-15
### Fixed
- The duration of live YouTube streams is now correctly formatted again
- Queueing massive YouTube playlists (4000+ tracks) now works

## [1.6.0] - 2022-03-13
### Changed
- Now uses [esmo](https://github.com/antfu/esno) so we don't have to build
- `/seek` and `/fseek` can now be given duration strings. For example, `1m` and `2m 15s` work. If the input consists only of numbers, Muse will treat it as the number of seconds to advance (backwards-compatible behavior).

## [1.5.0] - 2022-03-12
### Changed
- Muse will now allow the member who invited Muse to set config options. For this to work, the View Audit Logs permission must be given when inviting Muse. If it isn't given, Muse still works and will contact the owner instead for initial setup.

## [1.4.1] - 2022-03-12
### Changed
- Bumped dependencies (really just wanted to test some workflows :))

## [1.4.0] - 2022-03-12
### Added
- Muse can now HTTP stream live audio files (see #396)

## [1.3.0] - 2022-03-09
### Added
- `/play` has a new `split` option that will split queued YouTube videos into chapters, if the video has them
- `/resume` command to resume playback

### Changed
- `query` is now a required parameter from `/play`

### Removed
- `/play` cannot resume the playback anymore since `query` is now required

## [1.2.0] - 2022-02-24
### Added
- `/stop` command to disconnect and clear the queue

## [1.1.2] - 2022-02-21
### Changed
- Bumped dependencies

## [1.1.1] - 2022-02-12
### Fixed
- `/config set-wait-after-queue-empties` now works (fixed typo)

## [1.1.0] - 2022-02-11
### Changed
- Muse now stays in a voice channel after the queue finishes for 30 seconds by default. This behavior can be changed with `/config set-wait-after-queue-empties`.

## [1.0.0] - 2022-02-05
### Changed
- Migrated to [Slash Commands](https://support.discord.com/hc/en-us/articles/1500000368501-Slash-Commands-FAQ)
- Upgrading **will cause unavoidable data loss**. Because slash commands work differently, **all shortcuts will be lost**. Functionality similar to shortcuts is provided by the `/favorites` command.
- Because slash commands require different permissions, **you must kick Muse and re-add Muse to your server** before you can use the bot.

## [0.5.4] - 2022-02-01
### Fixed
- Prisma no longer causes a crash when running on Windows

## [0.5.3] - 2022-02-01
### Changed
- Environment variable values are now trimmed (whitespace is removed)

## [0.5.2] - 2022-01-29
### Fixed
- Playing livestreams now works again

## [0.5.1] - 2022-01-25
### Fixed
- Queueing Spotify playlists could sometimes fail when a song wasn't found on YouTube

## [0.5.0] - 2022-01-21
### Changed
- Queue embeds are now more detailed and appear when resuming playback. Thanks @bokherus!

## [0.4.0] - 2022-01-17
### Added
- Playlists can now be shuffled as they are added to the queue, using the `shuffle` option to `play`.

## [0.3.2] - 2022-01-17
### Fixed
- The SQLite database path is now correctly generated on Windows

### Changed
- Track lookups no longer fail silently (error is returned and logged)

## [0.3.1] - 2022-01-06
### Fixed
- Prisma client and migrations are no longer broken in built Docker images

## [0.3.0] - 2022-01-05
### Changed
- Migrated from Sequelize to Prisma. (#456)
- Bumped dependencies

## [0.2.1] - 2021-12-18
### Added
- [release-it](https://www.npmjs.com/package/release-it): makes it easier to generate new tags and releases

## [0.2.0]
### Added
- A custom track limit can now be set when queueing playlists from Spotify (default stays at 50). See #370.

## [0.1.1]
### Fixed
- Fixes a race condition in the file cache service (see #420)

## [0.1.0]
### Added
- Initial release

[unreleased]: https://github.com/codetheweb/muse/compare/v2.1.7...HEAD
[2.1.7]: https://github.com/codetheweb/muse/compare/v2.1.6...v2.1.7
[2.1.6]: https://github.com/codetheweb/muse/compare/v2.1.5...v2.1.6
[2.1.5]: https://github.com/codetheweb/muse/compare/v2.1.4...v2.1.5
[2.1.4]: https://github.com/codetheweb/muse/compare/v2.1.3...v2.1.4
[2.1.3]: https://github.com/codetheweb/muse/compare/v2.1.2...v2.1.3
[2.1.2]: https://github.com/codetheweb/muse/compare/v2.1.1...v2.1.2
[2.1.1]: https://github.com/codetheweb/muse/compare/v2.1.0...v2.1.1
[2.1.0]: https://github.com/codetheweb/muse/compare/v2.0.4...v2.1.0
[2.0.4]: https://github.com/codetheweb/muse/compare/v2.0.3...v2.0.4
[2.0.3]: https://github.com/codetheweb/muse/compare/v2.0.2...v2.0.3
[2.0.2]: https://github.com/codetheweb/muse/compare/v2.0.1...v2.0.2
[2.0.1]: https://github.com/codetheweb/muse/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/codetheweb/muse/compare/v1.9.0...v2.0.0
[1.9.0]: https://github.com/codetheweb/muse/compare/v1.8.2...v1.9.0
[1.8.2]: https://github.com/codetheweb/muse/compare/v1.8.1...v1.8.2
[1.8.1]: https://github.com/codetheweb/muse/compare/v1.8.0...v1.8.1
[1.8.0]: https://github.com/codetheweb/muse/compare/v1.7.0...v1.8.0
[1.7.0]: https://github.com/codetheweb/muse/compare/v1.6.2...v1.7.0
[1.6.2]: https://github.com/codetheweb/muse/compare/v1.6.1...v1.6.2
[1.6.1]: https://github.com/codetheweb/muse/compare/v1.6.0...v1.6.1
[1.6.0]: https://github.com/codetheweb/muse/compare/v1.5.0...v1.6.0
[1.5.0]: https://github.com/codetheweb/muse/compare/v1.4.1...v1.5.0
[1.4.1]: https://github.com/codetheweb/muse/compare/v1.4.0...v1.4.1
[1.4.0]: https://github.com/codetheweb/muse/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/codetheweb/muse/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/codetheweb/muse/compare/v1.1.2...v1.2.0
[1.1.2]: https://github.com/codetheweb/muse/compare/v1.1.1...v1.1.2
[1.1.1]: https://github.com/codetheweb/muse/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/codetheweb/muse/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/codetheweb/muse/compare/v0.5.4...v1.0.0
[0.5.4]: https://github.com/codetheweb/muse/compare/v0.5.3...v0.5.4
[0.5.3]: https://github.com/codetheweb/muse/compare/v0.5.2...v0.5.3
[0.5.2]: https://github.com/codetheweb/muse/compare/v0.5.1...v0.5.2
[0.5.1]: https://github.com/codetheweb/muse/compare/v0.5.0...v0.5.1
[0.5.0]: https://github.com/codetheweb/muse/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/codetheweb/muse/compare/v0.3.2...v0.4.0
[0.3.2]: https://github.com/codetheweb/muse/compare/v0.3.1...v0.3.2
[0.3.1]: https://github.com/codetheweb/muse/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/codetheweb/muse/compare/v0.2.1...v0.3.0
[0.2.1]: https://github.com/codetheweb/muse/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/codetheweb/muse/releases/tag/v0.2.0
[0.1.1]: https://github.com/codetheweb/muse/releases/tag/v0.1.1
[0.1.0]: https://github.com/codetheweb/muse/releases/tag/v0.1.0
