import UserType from "./user.model.js";
import { prisma } from "../../../prisma/prisma.js"
import type { Prisma } from "../../generated/prisma/client.js";
import CustomError from "../../constants/CustomError.js";
import StatusCode from "../../constants/StatusCode.js";

class UserRepository {

    async createuser(userBody: Prisma.UserCreateInput) {
        return await prisma.user.create({
            data: userBody
        })
    }

    async userExistsByEmail(email: string) {
        return await prisma.user.findFirst({
            where: {
                email: email
            },
            select: {
                email: true,
                name: true
            }
        })
    }

    async authenticateUser(email: string) {
        return await prisma.user.findFirst({
            where: {
                email,
            },
            select: {
                email: true,
                password: true,
                id: true
            }
        })
    }
}

export default UserRepository;