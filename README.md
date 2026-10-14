GitSentinel

AI-Powered DevOps Incident Investigation & Automated Bug Fixing

From error logs to potential code fixes — through a conversation.

GitSentinel is a solo-developed project exploring how AI agents and Model Context Protocol (MCP) can help developers investigate software bugs and streamline incident resolution.

The idea is simple: connect a GitHub repository, describe a problem through chat, and provide the relevant error logs or stack traces. GitSentinel aims to use that information and the repository's code context to investigate the issue, identify a potential root cause, and help generate a fix that can ultimately be submitted as a pull request.

The long-term vision is to bring debugging, code investigation, and remediation into a single conversational workflow instead of requiring developers to switch between multiple tools.

Project status: Under active development. The end-to-end incident investigation and automated remediation workflow is still evolving.

---

The Problem

When an application fails, developers often need to:

- Inspect application logs and stack traces.
- Locate the relevant code in a repository.
- Trace errors across different modules.
- Identify the root cause of a failure.
- Implement and test a fix.
- Create a branch, commit changes, and raise a pull request.

This process can involve considerable manual effort, particularly when the error message alone does not explain the underlying issue.

AI assistants can help with debugging, but connecting the conversation to repository context and an actionable code-change workflow introduces additional engineering challenges.

The Idea Behind GitSentinel

GitSentinel aims to connect conversational AI with repository-aware debugging and DevOps workflows.

A developer should be able to explain an issue naturally, provide relevant evidence, and work with the system to investigate the problem.

The intended workflow is:

1. Connect a repository — provide access to the GitHub repository that needs investigation.
2. Report an issue — describe the bug or paste logs, error messages, and stack traces into the chat.
3. Investigate — use AI reasoning and available tools to examine the problem and relevant source code.
4. Identify the root cause — present a likely explanation based on the available evidence.
5. Propose a fix — prepare a targeted code change.
6. Create a pull request — work toward submitting the proposed changes for review.

The complete workflow is a development goal, not a claim that every stage is already implemented.

Current Architecture

The repository is organized into four main components:

Component| Responsibility
"client"| Angular frontend application
"gateway"| Gateway service
"orchestrator-server"| Backend orchestration service
"mcp"| MCP server and repository-tooling integration

Architecture overview

flowchart TD
    U[Developer] --> C[Angular Client]
    C --> G[Gateway]
    G --> O[Orchestrator Server]
    O --> M[MCP Service]
    M --> R[Repository Tools]
    O --> D[(PostgreSQL)]
    O --> A[AI Investigation Workflow]
    A --> O
    O --> C

This diagram illustrates the intended high-level responsibilities and interaction between components. The final end-to-end flow and individual integrations are still subject to implementation.

Technology Stack

Technology| Role
Angular| Frontend application
TypeScript| Typed application and service development
Node.js| Backend runtime
Express.js| HTTP services and API handling
Model Context Protocol (MCP)| Tool integration
PostgreSQL| Relational database
Prisma| Database access and ORM
GitHub| Repository context and intended pull-request workflow

Development Status

GitSentinel is being developed incrementally. The following table distinguishes what is visible in the repository from the larger product goals.

Area| Status
Angular client project| Present
Backend service structure| Present
MCP service and HTTP endpoint| Present
Database integration foundations| Present
Conversational incident investigation| In development
Repository-aware root-cause analysis| In development
AI-generated code fixes| In development
Automated pull-request creation| Planned end-to-end capability
Automated testing and fix validation| Future development area

These statuses describe the scope visible from the inspected repository files, not a complete runtime or integration-test audit. Individual components may contain additional functionality.

Engineering Focus

As a solo-developed project, GitSentinel is an opportunity to explore and implement several engineering challenges:

- Designing a modular, multi-service backend architecture.
- Integrating MCP into an application workflow.
- Coordinating AI-assisted investigation across services.
- Connecting conversational requests to repository-aware tooling.
- Building a reliable workflow for proposed code modifications.
- Designing safe boundaries around automated code changes.

Roadmap

- [ ] Complete the conversational incident-investigation workflow.
- [ ] Connect user-provided logs and error reports to repository analysis.
- [ ] Improve root-cause analysis and evidence-based explanations.
- [ ] Implement targeted code-change generation.
- [ ] Complete the GitHub pull-request creation workflow.
- [ ] Introduce automated validation for generated changes.
- [ ] Improve error handling, observability, and workflow reliability.
- [ ] Strengthen repository permission controls and secure tool execution.

The roadmap will evolve as the project develops.

Safety and Human Review

Automated code changes can introduce regressions or fail to address the underlying problem. GitSentinel's intended workflow is therefore centered on producing inspectable changes and reviewable pull requests.

Before proposed changes are merged, they should be reviewed and validated. Repository permissions, credential handling, and restrictions on tool execution are also important considerations as the automation capabilities mature.

About the Project

GitSentinel is developed independently by Niroj Shah.

The project focuses on backend engineering, AI-powered developer tooling, MCP integration, and DevOps automation.

- GitHub: "NirojShah" (https://github.com/NirojShah)
- Repository: "GitSentinel" (https://github.com/NirojShah/Gitsentinel)

---

GitSentinel — making software debugging more conversational and code remediation more actionable.
