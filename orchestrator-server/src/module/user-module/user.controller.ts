import { response, type Request, type Response } from "express";
import UserServiceImplementation from "./user.service.js";
import type { UserCreateInput } from "../../generated/prisma/models.js";
import type UserType from "./user.model.js";

class UserController {
    private userService = new UserServiceImplementation();
    async CreateUser(req: Request, res: Response): Promise<Response> {
        const body = req.body;
        const resp = await this.userService.createUser(body as UserCreateInput)
        return res.status(resp.statusCode).json({
            message: resp.message,
            data: resp.data
        })
    }

    async LoginUser(req: Request, res: Response) {
        const loginCredential = req.body as UserType.Login;
        const resp = await this.userService.loginUser(loginCredential)
        return res.status(resp.statusCode).json({
            message: resp.message,
            data: resp.data
        })
    }
}

export default UserController;