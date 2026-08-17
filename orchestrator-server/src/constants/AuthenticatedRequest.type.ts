import { Request } from "express";

interface AuthenticatedRequest extends Request {
    user: {
        userId: string;
        email: string;
    };
}

export default AuthenticatedRequest;