import type { NextFunction, Response } from "express";
import CustomError from "../constants/CustomError.js";
import StatusCode from "../constants/StatusCode.js";
import AuthUtility from "../utility/token.generate.js";
import type AuthenticatedRequest from "../constants/AuthenticatedRequest.type.js";

function authMiddleware(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): void {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            throw new CustomError(
                StatusCode.UNAUTHORIZED,
                "Authorization header is missing."
            );
        }

        const [scheme, token] = authHeader.split(" ");

        if (scheme !== "Bearer" || !token) {
            throw new CustomError(
                StatusCode.UNAUTHORIZED,
                "Invalid authorization format. Expected Bearer token."
            );
        }

        const tokenResult = AuthUtility.compareToken(token);

        if (!tokenResult.isAuthenticated) {
            throw new CustomError(
                StatusCode.UNAUTHORIZED,
                "Invalid or expired auth token."
            );
        }

        const data = tokenResult.data;

        if (!data?.email || !data?.id) {
            throw new CustomError(
                StatusCode.UNAUTHORIZED,
                "Invalid token payload."
            );
        }

        req.user = {
            email: data.email,
            userId: data.id,
        };
        console.log(req.user)
        next();
    } catch (err) {
        next(err);
    }
}

export default authMiddleware;