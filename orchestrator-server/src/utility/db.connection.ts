import { prisma } from "../../prisma/prisma.js"

const connectDatabase = async () => {
    try {
        await prisma.$connect();
        console.log("DB CONNECTED SUCCESSFULLY.")
    } catch (err) {
        console.error("Database connection failed.");
        throw new Error("Database connection failed.", { cause: err });
    }
}

export default connectDatabase;