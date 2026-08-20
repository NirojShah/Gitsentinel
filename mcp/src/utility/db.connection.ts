import { Client } from "pg";

class DatabaseConnection {
    private readonly dbUrl =
        "postgresql://admin:admin%40123@localhost:5432/gitsentinel?schema=public";

    private readonly client: Client;

    constructor() {
        this.client = new Client({
            connectionString: this.dbUrl,
        });
    }

    async connectToDatabase(): Promise<boolean> {
        try {
            await this.client.connect();
            console.log("Connected to PostgreSQL");
            return true;
        } catch (error) {
            console.error("Failed to connect to PostgreSQL:", error);
            return false;
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