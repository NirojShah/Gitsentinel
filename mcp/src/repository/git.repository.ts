import type GitRepositoryInterface from "./git.repository.interface.js";
import type { Client } from "pg";

interface GitRepositoryEntity {
    id: string;
    provider: string;
    repoUrl: string;
    accessToken: string;
    baseBranch: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
}

class GitRepository implements GitRepositoryInterface {
    constructor(private readonly dbClient: Client) { }

    async getRepoById(repoId: string): Promise<GitRepositoryEntity | null> {
        try {

            const query = `
            SELECT
            id,
            provider,
            "repoUrl",
            "accessToken",
            "baseBranch",
            "createdAt",
            "updatedAt",
            "userId"
            FROM "gitrepo"
            WHERE id = $1
            LIMIT 1
            `;

            const result = await this.dbClient.query<GitRepositoryEntity>(
                query,
                [repoId]
            );

            return result.rows[0] ?? null;
        } catch (err) {
            console.log((err as Error).message)
            return null;
        }
    }

    async checkRepoExists(repoId: string): Promise<boolean> {
        try {
            console.log("Checking repository:", repoId);

            const query = `
            SELECT EXISTS (
                SELECT 1
                FROM "gitrepo"
                WHERE id = $1
            ) AS "exists"
        `;

            const result = await this.dbClient.query<{ exists: boolean }>(
                query,
                [repoId]
            );

            return result.rows[0].exists;
        } catch (err) {
            console.error("Database error:", err);
            return false;
        }
    }
}

export default GitRepository;