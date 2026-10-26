import { prisma } from "../../../prisma/prisma.js";
import type ChatModel from "./chat.model.js";

class ChatRepository {
    async repoBelongsToUser(repoId: string, userId: string): Promise<boolean> {
        const repo = await prisma.gitRepo.findFirst({
            where: {
                id: repoId,
                userId,
            },
            select: {
                id: true,
            },
        });
        return repo !== null;
    }

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
            include: {
                gitRepo: {
                    select: {
                        repoUrl: true,
                    },
                },
            },
        });
    }

    async update(data: ChatModel.UpdateChat, userId: string) {
        return prisma.chat.update({
            where: {
                id: data.chatId,
                userId,
            },
            data: {
                chatName: data.chatName,
            },
        });
    }

    async findById(id: string, userId: string) {
        return prisma.chat.findFirst({
            where: {
                id,
                userId,
            },
        });
    }

    async chatExistsById(id: string, userId: string): Promise<boolean> {
        const isChatExists = await prisma.chat.findFirst({
            where: {
                id,
                userId,
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

    async delete(id: string, userId: string) {
        return prisma.$transaction(async (tx) => {
            await tx.message.deleteMany({
                where: {
                    chatId: id,
                },
            });
            return tx.chat.delete({
                where: {
                    id,
                    userId,
                },
            });
        });
    }

    async findChatByUserId(userId: string) {
        return await prisma.chat.findMany({
            where: {
                user: {
                    id: userId
                }
            },
            orderBy: {
                createdAt: "desc",
            },
            select: {
                chatName: true,
                id: true,
                userId: true,
                repoId: true,
                gitRepo: {
                    select: {
                        repoUrl: true,
                    },
                },
            }
        })
    }
}

export default ChatRepository;