import { createServer, request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";
import type { IncomingMessage, ServerResponse } from "node:http";

const port = Number(process.env.PORT) || 5050;
const orchestratorUrl = new URL(process.env.ORCHESTRATOR_URL || "http://127.0.0.1:5000");
const allowedOrigins = new Set(
    (process.env.ALLOWED_ORIGINS || "http://localhost:4200,http://127.0.0.1:4200")
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean),
);

function applyCors(req: IncomingMessage, res: ServerResponse): void {
    const origin = req.headers.origin;
    if (origin && allowedOrigins.has(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
        res.setHeader("Vary", "Origin");
        res.setHeader("Access-Control-Allow-Credentials", "true");
        res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    }
}

const server = createServer((req, res) => {
    applyCors(req, res);

    if (req.method === "OPTIONS") {
        res.writeHead(204).end();
        return;
    }
    if (req.method === "GET" && req.url === "/health") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "ok", service: "gateway" }));
        return;
    }
    if (!req.url || !(req.url === "/app/v1" || req.url.startsWith("/app/v1/"))) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Route not found." }));
        return;
    }

    const request = (orchestratorUrl.protocol === "https:" ? httpsRequest : httpRequest)(
        {
            hostname: orchestratorUrl.hostname,
            port: orchestratorUrl.port || (orchestratorUrl.protocol === "https:" ? 443 : 80),
            method: req.method,
            path: req.url,
            headers: { ...req.headers, host: orchestratorUrl.host },
        },
        (upstreamResponse) => {
            res.writeHead(upstreamResponse.statusCode || 502, {
                ...upstreamResponse.headers,
                ...res.getHeaders(),
            });
            upstreamResponse.pipe(res);
        },
    );

    request.setTimeout(120_000, () => {
        request.destroy(new Error("Orchestrator request timed out."));
    });
    request.on("error", (error: Error) => {
        console.error("Gateway request to orchestrator failed:", error);
        if (!res.headersSent) {
            res.writeHead(502, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ message: "Orchestrator service is unavailable." }));
        } else {
            res.end();
        }
    });
    req.pipe(request);
});

server.listen(port, "127.0.0.1", () => {
    console.log(`Gateway listening on http://127.0.0.1:${port}`);
});
