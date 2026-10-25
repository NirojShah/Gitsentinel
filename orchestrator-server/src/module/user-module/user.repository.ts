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

    async userExistsByUsername(username: string) {
        return prisma.user.findUnique({
            where: { username },
            select: { id: true },
        });
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

    async findProfileById(userId: string) {
        return prisma.user.findUnique({
            where: { id: userId },
            select: {
                name: true,
                email: true,
                username: true,
                isActive: true,
                isVerified: true,
            },
        });
    }
}

export default UserRepository;