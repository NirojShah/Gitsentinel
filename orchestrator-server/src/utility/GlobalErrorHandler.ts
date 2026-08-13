import type { Request, Response, NextFunction } from "express";

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

    res.status(500).json(responseBody);
};

export default GlobalErrorHandler;