import { Client } from "pg";

class DatabaseConnection {
    private readonly client: Client;
    private readonly dbUrl = "postgresql://admin:admin%40123@localhost:5432/gitsentinel?schema=public"

    constructor() {
        this.client = new Client({
            connectionString: this.dbUrl,
        });
    }

    async connectToDatabase(): Promise<Client> {
        try {
            const connection: Client = await this.client.connect();
            console.log("Connected to PostgreSQL");
            return connection;
        } catch (error) {
            console.error("Failed to connect to PostgreSQL:", error);
            throw new Error((error as Error).message)
        }
    }

    getClient(): Client {
        return this.client;
    }

    async disconnectFromDatabase(): Promise<void> {
        await this.client.end();
    }
}

export default DatabaseConnection;