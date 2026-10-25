import type { Request, Response, NextFunction } from "express";
import CustomError from "../constants/CustomError.js";

const GlobalErrorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const responseBody: {
        success: boolean;
        message: string;
        stackTrace?: string;
    } = {
        success: false,
        message: err.message || "Internal Server Error",
    };

    if (process.env.NODE_ENV === "dev") {
        responseBody.stackTrace = err.stack;
    }

    res.status(err instanceof CustomError ? err.statusCode : 500).json(responseBody);
};

export default GlobalErrorHandler;