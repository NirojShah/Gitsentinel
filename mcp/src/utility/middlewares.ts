import type { NextFunction, Request, Response } from "express";


const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            throw new Error("Invalid token.")
        }
        
    } catch (err) {
        throw new Error((err as Error).message)
    }
}

export default authMiddleware;