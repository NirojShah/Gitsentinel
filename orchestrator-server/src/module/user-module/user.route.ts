import { Router } from "express";
import type { Router as RouterType, Request, Response } from "express";
import UserController from "./user.controller.js";

const userController = new UserController()
const UserRoute: RouterType = Router();

UserRoute.post("/signup", async (req: Request, res: Response) => await userController.CreateUser(req, res))
UserRoute.post("/login", async (req: Request, res: Response) => await userController.LoginUser(req, res))


export default UserRoute;