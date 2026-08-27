import type { Prisma } from "../../generated/prisma/client.js";


namespace ChatModel {
    export type createChat = {
        chatName?: string;
        userId: string,
        repoId: string
    }

    export type updateChat = Prisma.ChatUpdateInput

    export type getChat = {
        id: string
    }
}

export default ChatModel;