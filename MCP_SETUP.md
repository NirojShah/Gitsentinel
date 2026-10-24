# MCP Integration Setup Guide

This document explains how to configure the MCP (Model Context Protocol) integration between the orchestrator-server and the MCP service.

## Architecture Overview

The GitSentinel project now has full MCP integration across three layers:

1. **MCP Service** (`/mcp`) - Independent MCP server that provides tools for GitHub operations
2. **Orchestrator Server** (`/orchestrator-server`) - Backend that connects to MCP and exposes MCP endpoints
3. **Angular Client** (`/client`) - Frontend UI that displays MCP status and available tools

## Environment Configuration

### MCP Service Configuration

Edit `/mcp/src/env/.env.development`:

```env
MCP_SERVER_PORT=5001
MCP_TRANSPORT=sse
MCP_AUTH_SECRET=super_secret_mcp_token
ENCRYPTION_KEY=a_32_byte_secret_key_for_db_keys
DB_URL="postgresql://postgres:postgres@localhost:5432/gitsentinel_db?schema=public"
```

### Orchestrator Server Configuration

Edit `/orchestrator-server/src/env/.env.development`:

```env
PORT=5000
ALLOWED_SERVER=http://localhost:4200,http://localhost:5000
DB_URL=postgresql://postgres:postgres@localhost:5432/gitsentinel_db?schema=public

# MCP Service Configuration
MCP_SERVER_URL=http://127.0.0.1:5001/mcp
MCP_AUTH_SECRET=super_secret_mcp_token
```

**Important**: The `MCP_AUTH_SECRET` must match between both services for authentication to work.

## Starting the Services

### 1. Start the MCP Service

```bash
cd mcp
npm install
npm run dev
```

The MCP service will start on `http://127.0.0.1:5001/mcp`

### 2. Start the Orchestrator Server

```bash
cd orchestrator-server
npm install
npm run dev
```

The orchestrator server will start on `http://127.0.0.1:5000`

### 3. Start the Angular Client

```bash
cd client
npm install
npm start
```

The Angular client will start on `http://localhost:4200`

## MCP Integration Features

### Backend (Orchestrator Server)

- **MCP Service** (`/orchestrator-server/src/service/mcp service/mcp.service.ts`):
  - Manages connection to MCP server using HTTP transport
  - Provides methods to get available tools and execute them
  - Handles connection lifecycle (connect/disconnect)

- **MCP Module** (`/orchestrator-server/src/module/mcp-module/`):
  - REST endpoints for MCP operations:
    - `GET /app/v1/mcp/status` - Check MCP connection status
    - `GET /app/v1/mcp/tools` - List available MCP tools
    - `POST /app/v1/mcp/execute` - Execute an MCP tool
    - `POST /app/v1/mcp/connect` - Connect to MCP server
    - `POST /app/v1/mcp/disconnect` - Disconnect from MCP server

- **Message Service Integration**:
  - Automatically detects when MCP tools might be needed based on message content
  - Returns available MCP tools with message responses when relevant keywords are detected

### Frontend (Angular Client)

- **MCP Service** (`/client/src/app/app/core/mcp-service/mcp.service.ts`):
  - HTTP client to communicate with orchestrator-server MCP endpoints
  - Methods for status, tools, execution, connect, and disconnect

- **MCP Status Component** (`/client/src/app/app/component/mcp-status/`):
  - Displays MCP connection status (Connected/Disconnected)
  - Shows available MCP tools in an expandable list
  - Provides Connect/Disconnect/Refresh buttons
  - Integrated into the home page above the chat interface

- **Chat Window Integration**:
  - Messages from the assistant now include MCP tool availability information
  - Collapsible "MCP Tools Available" indicator shows which tools are relevant
  - Tools are displayed with name and description in a styled list

## Usage Flow

1. User logs into the Angular client
2. MCP status component shows connection status (initially disconnected)
3. User clicks "Connect" to establish MCP connection
4. Once connected, available tools are displayed
5. When user sends a message with keywords like "file", "repository", "commit", etc.:
   - Backend detects the relevance
   - Returns available MCP tools with the message
   - Frontend displays "MCP Tools Available" indicator in the chat bubble
6. User can expand the tool list to see what tools are available for that context

## MCP Tools Available

The MCP service currently provides the following tools:

- **githubfilefetch**: Fetch a file from a GitHub repository for updates and comparison
  - Parameters: `path`, `branch` (optional), `repositoryId`

Additional tools can be registered in `/mcp/src/service/mcp.server.tools.ts`

## Troubleshooting

### MCP Connection Fails

1. Ensure MCP service is running on port 5001
2. Check that `MCP_AUTH_SECRET` matches in both services
3. Verify the `MCP_SERVER_URL` is correct in orchestrator-server config
4. Check browser console and server logs for specific error messages

### Tools Not Showing in Chat

1. Ensure MCP is connected (check status component)
2. Message must contain relevant keywords (file, repository, commit, etc.)
3. Check that the message service integration is working correctly
4. Verify the backend is returning `mcpToolsAvailable` in the message response

### CORS Issues

If you encounter CORS errors between the Angular client and orchestrator-server:
- Ensure `ALLOWED_SERVER` in orchestrator-server includes `http://localhost:4200`
- Check that the CORS middleware is properly configured in `/orchestrator-server/src/app.ts`

## Next Steps

To enhance the MCP integration further:

1. Implement AI-based tool selection (currently using keyword heuristics)
2. Add actual tool execution from the chat interface
3. Display tool execution results in the chat
4. Add tool execution history
5. Implement tool result caching
6. Add more MCP tools for additional GitHub operations
