import { Request as ExpressRequest } from "express";

// -----------------------------------------------------
// Convert Express Request -> Web Standard Request
// -----------------------------------------------------

function createWebRequest(req: ExpressRequest): globalThis.Request {
    const protocol = req.headers["x-forwarded-proto"]?.toString() || req.protocol || "http";

    const host = req.get("host");

    if (!host) {
        throw new Error("Missing Host header");
    }

    const url =
        `${protocol}://${host}${req.originalUrl}`;

    const isBodyless = req.method === "GET" || req.method === "HEAD";

    const body = isBodyless ? undefined : JSON.stringify(req.body);

    return new globalThis.Request(url, {
        method: req.method,
        headers: createWebHeaders(req),
        body,
    });
}


// -----------------------------------------------------
// Convert Express headers -> Web Headers
// -----------------------------------------------------

function createWebHeaders(
    req: ExpressRequest
): Headers {
    const headers = new Headers();

    for (const [key, value] of Object.entries(req.headers)) {
        if (value === undefined) {
            continue;
        }

        if (Array.isArray(value)) {
            headers.set(key, value.join(", "));
        } else {
            headers.set(key, value);
        }
    }

    return headers;
}


const MCPUtility = {
    createWebHeaders,
    createWebRequest
}
export default MCPUtility;