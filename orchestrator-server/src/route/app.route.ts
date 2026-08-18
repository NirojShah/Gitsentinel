import { Router } from "express";
import type { Router as Mainrouter, NextFunction, Request, Response } from "express"
import UserRoute from "../module/user-module/user.route.js";
import gitRouter from "../module/git-module/git.route.js";
import authMiddleware from "../middleware/auth.middleware.js";
import type AuthenticatedRequest from "../constants/AuthenticatedRequest.type.js";

const appRoute: Mainrouter = Router();

appRoute.get("/status", async (req: Request, res: Response) => {
    return res.status(200).send("server is running.")
})

appRoute.use("/user", UserRoute)
appRoute.use(
    (req: Request, res: Response, next: NextFunction) => {
        authMiddleware(req as AuthenticatedRequest, res, next);
    }
);
appRoute.use("/git", gitRouter)

appRoute.use("", async (req: Request, res: Response) => {
    return res.status(200).json({
        status: "failed",
        message: "Invalid route."
    })
})

export default appRoute;