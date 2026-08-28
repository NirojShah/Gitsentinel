import z from "zod";
import type { Prisma } from "../../generated/prisma/client.js";


namespace ChatModel {

    export const CreateChatSchema = z.object({
        chatName: z.string().trim().min(1).max(100).optional(),
        userId: z.string().min(1),
        repoId: z.string().min(1)

    })

    export type CreateChat = z.infer<typeof CreateChatSchema>


    export const UpdateChatSchema = z.object({
        chatName: z.string().min(1).max(100),
        chatId: z.string().min(1)
    })

    export type UpdateChat = z.infer<typeof UpdateChatSchema>

    export type GetChat = {
        id: string
    }

    export const GetChatSchema = z.object({
        chatId: z.string().min(1),
    });
}

export default ChatModel;