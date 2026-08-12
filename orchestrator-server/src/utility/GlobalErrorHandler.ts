import type { Request, Response, NextFunction } from "express";

const GlobalErrorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    res.status(500).json({
        success: false,
        message: err.message || "Internal Server Error",
    });
};

export default GlobalErrorHandler;