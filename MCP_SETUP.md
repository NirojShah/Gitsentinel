# AI and MCP integration setup

The chat flow is wired through the Angular client, orchestrator, AI provider SDK, and MCP server:

1. Add an OpenAI, Anthropic Claude, or Google Gemini configuration in **AI Configuration**.
2. Start a chat attached to a repository and send a message.
3. The orchestrator loads the latest saved provider configuration, sends chat history to that provider, and advertises the read-only `githubfilefetch` MCP tool.
4. If the model requests that tool, the orchestrator binds it to the repository attached to the chat, executes the tool, and returns the result to the model before saving the assistant reply.
5. The assistant reply and MCP tool availability are shown in the chat.

The chat flow intentionally does not expose the MCP tool that creates commits and pull requests. That write operation needs a separate explicit review/confirmation flow before it can safely be made available.

## Configure environment

Copy each example file to `.env.development` in its service directory and set real values locally. Do not commit the development files.

### MCP service (`mcp/src/env/.env.development`)

```env
HOST=127.0.0.1
MCP_SERVER_PORT=5001
MCP_AUTH_SECRET=<long-random-shared-secret>
DB_URL=postgresql://USER:PASSWORD@localhost:5432/gitsentinel_db?schema=public
```

### Orchestrator (`orchestrator-server/src/env/.env.development`)

```env
PORT=5000
ALLOWED_SERVER=http://localhost:4200,http://localhost:5000
DB_URL=postgresql://USER:PASSWORD@localhost:5432/gitsentinel_db?schema=public
MCP_SERVER_URL=http://127.0.0.1:5001/mcp
MCP_AUTH_SECRET=<same-long-random-shared-secret>
AI_KEY_ENCRYPTION_KEY=<64-hex-characters-encoding-32-random-bytes>
```

Use the same `MCP_AUTH_SECRET` in both services. Generate a separate random 32-byte `AI_KEY_ENCRYPTION_KEY` and keep it backed up securely; losing or changing it makes already-stored provider keys unreadable. Provider API keys are encrypted with AES-256-GCM before database storage, and API responses return only `hasApiKey`, never the key itself.

The AI configuration migration must be applied before using the configuration UI:

```bash
cd orchestrator-server
npx prisma migrate deploy
npx prisma generate
```

Start the services in separate terminals:

```bash
cd mcp && npm run dev
cd orchestrator-server && npm run dev
cd client && npm start
```

The client sends API requests through the gateway at `http://127.0.0.1:5050`; start it in another terminal:

```bash
cd gateway
PORT=5050 ORCHESTRATOR_URL=http://127.0.0.1:5000 npm run dev
```

## Available endpoints

All orchestrator routes use `/app/v1` and require the user's bearer access token. The gateway forwards those requests to the orchestrator; the MCP server separately requires its shared bearer secret on `/mcp`. Only the MCP health endpoint is unauthenticated.

- `POST/GET /app/v1/ai-configuration` and `PUT /app/v1/ai-configuration/:configurationId`
- `GET /app/v1/mcp/status` and `/app/v1/mcp/tools`
- `POST /app/v1/mcp/connect`, `/disconnect`, and `/execute`
- `POST /app/v1/message` for the provider-backed chat workflow

The MCP execution endpoint currently permits only `githubfilefetch`, and verifies repository ownership against the authenticated user. The AI tool loop is capped at three rounds per message.

## Troubleshooting

- **Credential encryption error:** Ensure `AI_KEY_ENCRYPTION_KEY` is exactly 64 hex characters or base64 encoding exactly 32 bytes, and that the same value remains configured across restarts.
- **MCP connection error:** Check that the MCP server is listening on port 5001, `MCP_SERVER_URL` is correct, both services use the same auth secret, and both use the expected database.
- **No AI response:** Add a provider configuration in the client, verify the provider/model/key combination, and check orchestrator logs for provider errors.
- **No repository tool use:** Check the MCP status panel and ensure the chat is attached to a repository belonging to the signed-in user. The model decides whether the read-only file-fetch tool is relevant to a message.
