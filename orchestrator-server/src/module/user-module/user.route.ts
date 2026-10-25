import { Router } from "express";
import type { Router as RouterType, Request, Response } from "express";
import UserController from "./user.controller.js";
import authMiddleware from "../../middleware/auth.middleware.js";
import type AuthenticatedRequest from "../../constants/AuthenticatedRequest.type.js";

const userController = new UserController()
const UserRoute: RouterType = Router();

UserRoute.post("/signup", async (req: Request, res: Response) => await userController.CreateUser(req, res))
UserRoute.post("/login", async (req: Request, res: Response) => await userController.LoginUser(req, res))
UserRoute.get("/profile", (req: Request, res: Response, next) =>
    authMiddleware(req as AuthenticatedRequest, res, next));
UserRoute.get("/profile", async (req: Request, res: Response) =>
    userController.GetProfile(req as AuthenticatedRequest, res));


export default UserRoute;