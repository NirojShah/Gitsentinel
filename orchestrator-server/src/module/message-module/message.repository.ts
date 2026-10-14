import type { PrismaClient } from "../../generated/prisma/client.js";
import type { MessageCreateInput } from "../../generated/prisma/models.js";

class MessageRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async save(data: MessageCreateInput) {
        return await this.prisma.message.create({
            data,
        });
    }

    async findByChatId(id: string, limit: number = 10, page: number = 1) {
        const offset: number = (page - 1) * limit;
        return await this.prisma.message.findMany({
            where: {
                chatId: id,
            },
            skip: offset,
            take: limit
        });
    }

    async delete(id: string, chatId: string, userId: string) {
        return await this.prisma.message.delete({
            where: {
                id: id,
                chatId: chatId,
                sender: userId
            }
        })
    }

    async messageContainsByUserIdAndChatId(userId: string, chatId: string): Promise<boolean> {
        const exists = await this.prisma.message.findFirst({
            where: {
                chatId: chatId,
                sender: userId
            },
            select: {
                id: true
            }
        });

        return exists !== null;
    }
}

export default MessageRepository;