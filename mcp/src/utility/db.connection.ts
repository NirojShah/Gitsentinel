import { Client } from "pg";

class DatabaseConnection {
    private readonly client: Client;

    constructor() {
        const dbUrl = process.env.DB_URL;
        if (!dbUrl) {
            throw new Error("DB_URL must be configured for the MCP service.");
        }
        this.client = new Client({ connectionString: dbUrl });
    }

    async connectToDatabase(): Promise<Client> {
        try {
            await this.client.connect();
            console.log("Connected to PostgreSQL");
            return this.client;
        } catch (error) {
            console.error("Failed to connect to PostgreSQL:", error);
            throw new Error("Failed to connect to the MCP database.");
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
