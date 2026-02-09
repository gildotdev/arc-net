# arc-net

A Model Context Protocol (MCP) server for ChatGPT and compatible AI assistants.

## Overview

arc-net is an MCP server built on Bun/Node.js that provides AI assistants with powerful tools and resources through the standardized Model Context Protocol. It supports both stdio (local) and HTTP/SSE (web) transports.

## Architecture

- **Type**: Monolithic MCP Server
- **Runtime**: Bun (latest stable) / Node.js 20+
- **Language**: TypeScript (strict mode)
- **Protocol**: MCP (Model Context Protocol)
- **Transports**: stdio (local), HTTP/SSE (web)

## Features

- **Screenshot Analysis**: Extract item names and quantities from ARC Raiders game screenshots using OCR
- **HTTP/SSE Transport**: Deploy to cloud platforms (Netlify, Cloudflare) for ChatGPT integration
- **stdio Transport**: Local integration support for desktop applications

## Development Principles

This project follows strict governance outlined in `.specify/memory/constitution.md`. Key principles:

1. **MCP Protocol Compliance** - All features adhere to MCP specification
2. **Monolithic Architecture** - Single codebase, single deployment
3. **Documentation-First** - Every feature documented before/during implementation
4. **Bun Runtime Standard** - Exclusive use of Bun for all development
5. **Test-Driven Development** - Tests written before implementation (TDD mandatory)

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) (latest stable version) or Node.js 20+

### Installation

```bash
# Install dependencies
npm install
```

### Running the Server

#### HTTP Server (for web deployment and ChatGPT)

```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start
```

The server will start on `http://localhost:3000`:
- MCP endpoint: `http://localhost:3000/mcp`
- Health check: `http://localhost:3000/health`

#### stdio Server (for local integration)

```bash
npm run dev:stdio
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
npm run typecheck

# Linting
npm run lint
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions on deploying to:
- Netlify (serverless functions)
- Cloudflare Workers (coming soon)
- Self-hosted HTTP server

## Project Structure

```
arc-net/
├── src/               # Source code
│   ├── index.ts       # stdio server (local)
│   ├── index-http.ts  # HTTP server (web)
│   ├── tools/         # MCP tool implementations
│   ├── services/      # Business logic
│   ├── models/        # Data structures
│   └── lib/           # Utilities
├── netlify/           # Netlify deployment
│   └── functions/     # Serverless functions
├── tests/             # Test files
├── docs/              # Documentation
├── .specify/          # Speckit templates and memory
└── specs/             # Feature specifications
```

## Documentation

- [Constitution](.specify/memory/constitution.md) - Project governance and principles
- [Deployment Guide](./DEPLOYMENT.md) - Cloud deployment instructions
- [Templates](.specify/templates/) - Specification and planning templates

## Contributing

All contributions must comply with the project constitution. See `.specify/memory/constitution.md` for development standards and requirements.

## License

[License TBD]
