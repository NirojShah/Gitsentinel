import type { PrismaClient } from "../../generated/prisma/client.js";
import type { MessageCreateInput } from "../../generated/prisma/models.js";

class MessageRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async save(data: MessageCreateInput) {
        return await this.prisma.message.create({
            data,
        });
    }

    async findByChatId(id: string) {
    }

    async delete(id: string) {
    }
}


export default MessageRepository;