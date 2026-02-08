<!--
SYNC IMPACT REPORT
==================
Version: 0.0.0 → 1.0.0
Action: Initial constitution creation
Rationale: MAJOR version for first ratification establishing all core principles

Modified Principles:
  - Created: I. MCP Server Protocol Compliance
  - Created: II. Monolithic Architecture
  - Created: III. Documentation-First
  - Created: IV. Bun Runtime Standard
  - Created: V. Test-Driven Development

Templates Requiring Updates:
  ✅ .specify/templates/plan-template.md - Constitution Check section exists
  ✅ .specify/templates/spec-template.md - Aligned with documentation requirements
  ✅ .specify/templates/tasks-template.md - Task categorization ready

Follow-up TODOs:
  - None - all placeholders filled
-->

# arc-net Constitution

## Core Principles

### I. MCP Server Protocol Compliance

arc-net is an MCP (Model Context Protocol) server designed for integration with ChatGPT and other 
AI assistants. Every feature, endpoint, and capability MUST adhere to the MCP specification.

**Requirements**:
- All tools and resources MUST follow MCP schema definitions
- Server capabilities MUST be properly declared in initialization
- Request/response formats MUST conform to MCP JSON-RPC 2.0 protocol
- Error handling MUST use MCP-defined error codes and structures
- Server MUST implement proper lifecycle management (initialize, shutdown)

**Rationale**: Protocol compliance ensures interoperability with all MCP clients and prevents 
integration failures. Non-compliance breaks the fundamental purpose of the server.

### II. Monolithic Architecture

arc-net follows a monolithic architecture pattern. All functionality resides in a single codebase 
and deployment unit.

**Requirements**:
- Single repository containing all server functionality
- Single process serving all MCP endpoints
- Shared configuration and state management
- Unified build and deployment pipeline
- Code organization by feature/domain, not by service boundaries

**Rationale**: Monolithic structure simplifies development, testing, deployment, and debugging for 
an MCP server. Service boundaries add unnecessary complexity for this use case.

### III. Documentation-First

Every feature, function, and design decision MUST be documented before or alongside implementation. 
Documentation is not optional.

**Requirements**:
- All MCP tools MUST have clear descriptions, parameter schemas, and usage examples
- All modules MUST have README files explaining purpose and usage
- All complex functions MUST have JSDoc comments
- Architecture decisions MUST be documented in `/docs/decisions/`
- User-facing features MUST have quickstart guides
- API contracts MUST be documented before implementation
- Code comments MUST explain "why", not "what"

**Rationale**: MCP servers expose AI-accessible tools. Clear documentation ensures proper tool 
usage by AI assistants and maintainability by human developers. Undocumented code is technical debt.

### IV. Bun Runtime Standard

arc-net is built exclusively on the Bun runtime. All code, tests, and tooling MUST use Bun.

**Requirements**:
- Use `bun` for package management (no npm/yarn/pnpm)
- Use `bun test` for all testing
- Use `bun run` for all scripts and execution
- Leverage Bun-native APIs where available (file I/O, HTTP server, WebSocket)
- Target Bun's JavaScript/TypeScript compatibility profile
- Configuration files MUST use Bun conventions (bunfig.toml)

**Rationale**: Bun provides a unified, fast runtime eliminating Node.js tooling fragmentation. 
Single runtime simplifies development environment and improves performance.

### V. Test-Driven Development

Tests MUST be written before implementation. TDD is the required development methodology.

**Requirements**:
- Write test cases covering acceptance criteria FIRST
- Verify tests fail (Red phase)
- Implement minimal code to pass tests (Green phase)
- Refactor while keeping tests passing (Refactor phase)
- Unit test coverage MUST exceed 80%
- Integration tests REQUIRED for:
  - MCP protocol compliance
  - Tool invocations
  - Resource providers
  - Error handling paths
- All PRs MUST include tests for new functionality
- No test-skipping without documented justification

**Rationale**: TDD ensures correctness, prevents regressions, and serves as living documentation. 
For MCP servers, incorrect behavior breaks AI assistant integrations silently.

## Technology Stack

**Runtime**: Bun (latest stable)  
**Language**: TypeScript (strict mode)  
**MCP SDK**: @modelcontextprotocol/sdk  
**Testing**: Bun's built-in test runner  
**Linting**: Biome (replaces ESLint/Prettier)  
**Type Checking**: TypeScript compiler (tsc)

**Dependency Policy**:
- Minimize external dependencies
- Prefer Bun-native APIs over third-party libraries
- All dependencies MUST be actively maintained
- Security vulnerabilities MUST be addressed within 7 days
- Major version updates require constitution check

## Development Workflow

**Branch Strategy**:
- `main` branch is always deployable
- Feature branches: `###-feature-name` format
- No direct commits to `main`

**Quality Gates**:
1. All tests pass (`bun test`)
2. No type errors (`bun run typecheck`)
3. Linter passes (`bun run lint`)
4. Documentation updated
5. Constitution compliance verified

**Code Review Requirements**:
- All changes require review
- Reviewer MUST verify constitution compliance
- Reviewer MUST verify tests exist and are meaningful
- Reviewer MUST verify documentation completeness

**Release Process**:
- Semantic versioning (MAJOR.MINOR.PATCH)
- CHANGELOG.md updated with all changes
- Git tags for all releases
- Breaking changes require MAJOR version bump

## Governance

This constitution supersedes all other development practices and guidelines. When conflicts arise 
between this document and other practices, this constitution takes precedence.

**Amendment Procedure**:
1. Propose amendment with rationale and impact analysis
2. Update affected templates and documentation
3. Increment constitution version semantically:
   - MAJOR: Backward-incompatible principle changes
   - MINOR: New principles or sections added
   - PATCH: Clarifications and wording improvements
4. Commit with message: `docs: amend constitution to vX.Y.Z`
5. Verify all dependent templates align

**Compliance Verification**:
- All PRs MUST include constitution compliance check
- Templates MUST remain synchronized with constitution
- Violations MUST be addressed before merge
- Repeated violations indicate need for process improvement

**Constitution Authority**:
- Development decisions MUST align with core principles
- Exceptions require explicit justification and documentation
- Unjustified complexity is prohibited
- Principle violations block deployment

**Version**: 1.0.0 | **Ratified**: 2026-02-08 | **Last Amended**: 2026-02-08
