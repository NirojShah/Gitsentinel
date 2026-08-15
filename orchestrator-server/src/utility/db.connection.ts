import { prisma } from "../../prisma/prisma.js"

const connectDatabase = async () => {
    try {
        await prisma.$connect();
        console.log("DB CONNECTED SUCCESSFULLY.")
    } catch (err) {
        console.log((err as Error).message)
    }
}

export default connectDatabase;