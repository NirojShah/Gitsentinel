import { prisma } from "../../../prisma/prisma.js";
import CustomError from "../../constants/CustomError.js";
import StatusCode from "../../constants/StatusCode.js";
import type { Prisma } from "../../generated/prisma/client.js";
import type ChatModel from "./chat.model.js";

class ChatRepository {
    async save(data: ChatModel.CreateChat) {
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

    async update(data: ChatModel.UpdateChat) {
        return prisma.chat.update({
            where: {
                id: data.chatId,
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

    async chatExistsById(id: string): Promise<boolean> {
        const isChatExists = await prisma.chat.findFirst({
            where: {
                id: id
            },
            select: {
                id: true
            }
        })

        if (isChatExists) {
            return true;
        }
        return false
    }

    async chatExistsByData(data: ChatModel.CreateChat): Promise<boolean> {
        const existingChat = await prisma.chat.findFirst({
            where: {
                chatName: data.chatName,
                userId: data.userId,
                repoId: data.repoId,
            },
            select: {
                id: true
            }
        });

        if (existingChat) {
            return true
        }
        return false
    }

    async findChatByUserId(userId: string) {
        return await prisma.chat.findMany({
            where: {
                user: {
                    id: userId
                }
            },
            select: {
                chatName: true,
                id: true,
                userId: true
            }
        })
    }
}

export default ChatRepository;