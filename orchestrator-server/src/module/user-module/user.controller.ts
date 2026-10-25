import type { Request, Response } from "express";
import UserServiceImplementation from "./user.service.js";
import type { UserCreateInput } from "../../generated/prisma/models.js";
import type UserType from "./user.model.js";
import type AuthenticatedRequest from "../../constants/AuthenticatedRequest.type.js";
import CustomError from "../../constants/CustomError.js";

class UserController {
    private userService = new UserServiceImplementation();
    async CreateUser(req: Request, res: Response): Promise<Response> {
        const body: unknown = req.body;
        if (typeof body !== "object" || body === null || Array.isArray(body)) {
            throw new CustomError(400, "Provide a valid email, username, and password.");
        }
        const { email, username, password, name } = body as Record<string, unknown>;
        if (
            typeof email !== "string" ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
            typeof username !== "string" ||
            !/^[a-zA-Z0-9_.-]{3,32}$/.test(username.trim()) ||
            typeof password !== "string" ||
            password.length < 8 ||
            (name !== undefined && name !== null && typeof name !== "string")
        ) {
            throw new CustomError(
                400,
                "Enter a valid email, a 3-32 character username, and a password of at least 8 characters.",
            );
        }
        const userData: UserCreateInput = {
            email: email.trim(),
            username: username.trim(),
            password,
            ...(typeof name === "string" && name.trim() ? { name: name.trim() } : {}),
        };
        const resp = await this.userService.createUser(userData)
        return res.status(resp.statusCode).json({
            message: resp.message,
            data: resp.data
        })
    }

    async LoginUser(req: Request, res: Response) {
        const body: unknown = req.body;
        if (
            typeof body !== "object" ||
            body === null ||
            Array.isArray(body) ||
            !("email" in body) ||
            !("password" in body) ||
            typeof body.email !== "string" ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim()) ||
            typeof body.password !== "string" ||
            !body.password
        ) {
            throw new CustomError(400, "A valid email and password are required.");
        }
        const loginCredential: UserType.Login = {
            email: body.email.trim(),
            password: body.password,
        };
        const resp = await this.userService.loginUser(loginCredential)
        return res.status(resp.statusCode).json({
            message: resp.message,
            data: resp.data
        })
    }

    async GetProfile(req: AuthenticatedRequest, res: Response): Promise<Response> {
        const response = await this.userService.getUserProfile(req.user.userId);
        return res.status(response.statusCode).json({
            message: "Profile loaded successfully.",
            data: response.data,
        });
    }
}

export default UserController;