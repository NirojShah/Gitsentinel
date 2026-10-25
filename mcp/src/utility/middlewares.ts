import type { NextFunction, Request, Response } from "express";
import { timingSafeEqual } from "node:crypto";

const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    const expectedSecret = process.env.MCP_AUTH_SECRET;
    const authorization = req.headers.authorization;
    const suppliedSecret = authorization?.startsWith("Bearer ")
        ? authorization.slice("Bearer ".length)
        : "";

    if (!expectedSecret || !suppliedSecret) {
        res.status(401).json({ error: "Unauthorized MCP request." });
        return;
    }

    const expected = Buffer.from(expectedSecret);
    const supplied = Buffer.from(suppliedSecret);
    if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) {
        res.status(401).json({ error: "Unauthorized MCP request." });
        return;
    }

    next();
};

export default authMiddleware;