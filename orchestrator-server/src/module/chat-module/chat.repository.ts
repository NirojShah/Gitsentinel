import { prisma } from "../../../prisma/prisma.js";
import CustomError from "../../constants/CustomError.js";
import StatusCode from "../../constants/StatusCode.js";
import type { Prisma } from "../../generated/prisma/client.js";

class ChatRepository {
    async save(data: {
        chatName?: string;
        userId: string;
        repoId: string;
    }) {
        const existingChat = await prisma.chat.findFirst({
            where: {
                chatName: data.chatName,
                userId: data.userId,
                repoId: data.repoId,
            },
        });

        if (existingChat) {
            throw new CustomError(StatusCode.BAD_REQUEST, "Chat already exists.")
        }

        return prisma.chat.create({
            data: {
                chatName: data.chatName,
                user: {
                    connect: {
                        id: data.userId,
                    },
                },
                gitRepo: {
                    connect: {
                        id: data.repoId,
                    },
                },
            },
        });
    }

    async update(id: string, data: Prisma.ChatUpdateInput) {
        return prisma.chat.update({
            where: {
                id,
            },
            data,
        });
    }

    async findById(id: string) {
        return prisma.chat.findUnique({
            where: {
                id,
            },
        });
    }
}