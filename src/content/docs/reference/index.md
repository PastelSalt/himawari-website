# Reference

Precise descriptions to look things up in. If you're learning, start with the [tutorial](/docs/tutorials/first-game) instead.

## The Script Data Contract (`spec/`)
The files every Himawari tool agrees on. They are licensed CC BY 4.0, so you can implement them in your own software.

| Document | What it covers |
|---|---|
| [Overview](https://github.com/PastelSalt/himawari-c/blob/v0.4.1/spec/README.md) | What's in the contract, and its versions |
| [Script language](https://github.com/PastelSalt/himawari-c/blob/v0.4.1/spec/language.md) | The `.hws` language for scenes |
| [Grammar](https://github.com/PastelSalt/himawari-c/blob/v0.4.1/spec/grammar.ebnf) | The language's grammar |
| [Project manifest](https://github.com/PastelSalt/himawari-c/blob/v0.4.1/spec/manifest.schema.json) | `himawari.json` |
| [Characters](https://github.com/PastelSalt/himawari-c/blob/v0.4.1/spec/character.schema.json) | Character files, including layered sprites |
| [Themes](https://github.com/PastelSalt/himawari-c/blob/v0.4.1/spec/theme.schema.json) | `theme/theme.json`: the look and layout of the built-in menus |
| [Extensions](https://github.com/PastelSalt/himawari-c/blob/v0.4.1/spec/extension.schema.json) | Signatures for custom statements written in C |
| [Bytecode](https://github.com/PastelSalt/himawari-c/blob/v0.4.1/spec/bytecode.md) | The compiled `.hwb` format the runtime plays |
| [Asset packs](https://github.com/PastelSalt/himawari-c/blob/v0.4.1/spec/pack.md) | `.hwp` packs and patches |
| [Debug protocol](https://github.com/PastelSalt/himawari-c/blob/v0.4.1/spec/debug-protocol.md) | How Studio drives the game in its preview |
| [AST](https://github.com/PastelSalt/himawari-c/blob/v0.4.1/spec/ast.schema.json) | The script as JSON |
| [License](https://github.com/PastelSalt/himawari-c/blob/v0.4.1/spec/LICENSE.md) | CC BY 4.0 |

## For AI assistants
| Document | What it covers |
|---|---|
| [Agent guide](https://github.com/PastelSalt/himawari-c/blob/v0.4.1/spec/agent-guide.md) | The rules Himawari gives an AI assistant |
| [Script language for models](https://github.com/PastelSalt/himawari-c/blob/v0.4.1/spec/llm-reference.md) | The language on two pages |
| [AI setup](/docs/ai-setup) | Connecting Claude Code or the Claude desktop app |

## Tools
| Tool | What it is |
|---|---|
| **Himawari Studio** | The editor, with the game playing beside it |
| **`hwc`** | The command line: `check`, `fmt`, `build [--release] [--patch]`, `run`, `playtest`, `graph`, `l10n`, `report ai-content`, `ai setup`, `init`, `disasm` |
| **`himawari-mcp`** | The server that lets Claude apps work on a project |
| **`himawari.exe`** | The runtime that plays a game, for example `himawari --project <folder>` while you're developing |

The README in the repository has [the build and command details](https://github.com/PastelSalt/himawari-c/blob/v0.4.1/README.md).

## Decisions and history
| Document | What it covers |
|---|---|
| [RFCs](https://github.com/PastelSalt/himawari-c/blob/v0.4.1/rfcs/README.md) | Written records of language and engine decisions |
| [The plan](https://github.com/PastelSalt/himawari-c/blob/v0.4.1/planning/DETAILED_PLAN.md) | The full design and roadmap |
| [Research](https://github.com/PastelSalt/himawari-c/blob/v0.4.1/planning/RESEARCH.md) | The evidence behind decisions |
| [Log](https://github.com/PastelSalt/himawari-c/blob/v0.4.1/planning/LOG.md) | Progress and the decision register |

## Project policies
[Contributing](https://github.com/PastelSalt/himawari-c/blob/v0.4.1/CONTRIBUTING.md) · [Governance](https://github.com/PastelSalt/himawari-c/blob/v0.4.1/GOVERNANCE.md) · [Privacy](https://github.com/PastelSalt/himawari-c/blob/v0.4.1/PRIVACY.md) · [Security](https://github.com/PastelSalt/himawari-c/blob/v0.4.1/SECURITY.md) · [Third-party notices](https://github.com/PastelSalt/himawari-c/blob/v0.4.1/THIRD_PARTY_NOTICES.md)
