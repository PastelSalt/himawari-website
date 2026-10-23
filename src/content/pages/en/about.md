---
updated: 2026-10-23
---

Himawari is a free, open-source visual novel engine and editor for Windows, made by [Moeko Works](https://moekoworks.vercel.app/) (on GitHub, [PastelSalt](https://github.com/PastelSalt)).

It's built around three promises: **easy enough for anyone, open enough for coders, and light enough for any Windows PC.** Everything can be done in Studio without code. The same project is plain text for people who code. Games start with a double-click on Windows 10 or 11, with nothing to install. AI help is optional, and Himawari never generates images, music, voices, or video.

The current version is an early public build. It works from start to finish, but testing with writers hasn't started yet. The [README](https://github.com/PastelSalt/himawari-c#readme) lists what's done, what's next, and the current limits.

## How the project is run

For version 1, Moeko Works decides what goes into Himawari and when it ships. Every decision is measured against the three promises, and the reasons are written down in public, in the project's decision log and its RFCs.

- **Bug fixes, docs, tests, and small improvements** come as pull requests, reviewed by a maintainer.
- **Changes to the script language, bytecode, or file formats** need an RFC first, because games, tools, and AI assistants all rely on them.

How decisions are made is in [GOVERNANCE.md](https://github.com/PastelSalt/himawari-c/blob/main/GOVERNANCE.md), and how to help is in [CONTRIBUTING.md](https://github.com/PastelSalt/himawari-c/blob/main/CONTRIBUTING.md).

## Licenses

| Part                                            | License                              |
| ----------------------------------------------- | ------------------------------------ |
| The game runtime, which ships inside every game | zlib                                 |
| The tools, compiler, MCP server, and Studio     | MIT                                  |
| The specifications and RFCs                     | CC BY 4.0                            |
| Templates and sample games                      | CC0 1.0                              |
| The Himawari and Moeko Works names and logos    | Not open; they belong to Moeko Works |

You can sell games made with Himawari. The zlib license doesn't require crediting Himawari, though it's appreciated.

## The names and logos

The Himawari and Moeko Works names and logos belong to Moeko Works and aren't covered by the open licenses. A fork may keep the code but should use its own name and logo. Games made with Himawari don't include this art.

## This website

This site follows the same rules as the software: no cookies for visitors, nothing loaded from other sites, and visits counted without knowing who you are. See [Privacy](/privacy).
