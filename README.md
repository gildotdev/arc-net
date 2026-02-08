# arc-net

A Model Context Protocol (MCP) server for ChatGPT and compatible AI assistants.

## Overview

arc-net is an MCP server built on Bun that provides AI assistants with powerful tools and resources through the standardized Model Context Protocol.

## Architecture

- **Type**: Monolithic MCP Server
- **Runtime**: Bun (latest stable)
- **Language**: TypeScript (strict mode)
- **Protocol**: MCP (Model Context Protocol)

## Development Principles

This project follows strict governance outlined in `.specify/memory/constitution.md`. Key principles:

1. **MCP Protocol Compliance** - All features adhere to MCP specification
2. **Monolithic Architecture** - Single codebase, single deployment
3. **Documentation-First** - Every feature documented before/during implementation
4. **Bun Runtime Standard** - Exclusive use of Bun for all development
5. **Test-Driven Development** - Tests written before implementation (TDD mandatory)

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) (latest stable version)

### Installation

```bash
# Install dependencies
bun install
```

### Running Tests

```bash
# Run all tests
bun test

# Run tests with coverage
bun test --coverage
```

### Development

```bash
# Type checking
bun run typecheck

# Linting
bun run lint
```

## Project Structure

```
arc-net/
├── src/               # Source code
├── tests/             # Test files
├── docs/              # Documentation
├── .specify/          # Speckit templates and memory
└── specs/             # Feature specifications
```

## Documentation

- [Constitution](.specify/memory/constitution.md) - Project governance and principles
- [Templates](.specify/templates/) - Specification and planning templates

## Contributing

All contributions must comply with the project constitution. See `.specify/memory/constitution.md` for development standards and requirements.

## License

[License TBD]
