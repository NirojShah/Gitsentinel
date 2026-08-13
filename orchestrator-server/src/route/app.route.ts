import { Router } from "express";
import type { Router as Mainrouter, Request, Response } from "express"
import UserRoute from "../module/user-module/user.route.js";

const appRoute: Mainrouter = Router();

appRoute.get("/status", async (req: Request, res: Response) => {
    return res.status(200).send("server is running.")
})

appRoute.use("/user", UserRoute)

appRoute.use("", async (req: Request, res: Response) => {
    return res.status(200).json({
        status: "failed",
        message: "Invalid route."
    })
})

export default appRoute;