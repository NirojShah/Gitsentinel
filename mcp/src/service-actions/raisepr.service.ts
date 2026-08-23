import { FetchFile } from "./resolve.file.js";

export interface CreatePrInput {
    owner: string;
    repo: string;
    baseBranch: string;
    branchName: string;
    filePath: string;
    fileContent: string;
    commitMessage: string;
    prTitle: string;
    prDescription?: string;
    accessToken: string;
}

export class RaisePrService {
    private readonly ResolveFile
    constructor(
    ) {
        this.ResolveFile = new FetchFile()
    }
    private getHeaders(accessToken: string): Record<string, string> {
        return {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "MCP-Git-Server",
        };
    }

    /**
     * Executes branch creation, file update/commit, and PR opening via GitHub REST API
     */
    async createBranchCommitAndRaisePr(input: CreatePrInput) {
        const {
            owner, repo, baseBranch, branchName,
            filePath, fileContent, commitMessage,
            prTitle, prDescription, accessToken,
        } = input;

        const headers = this.getHeaders(accessToken);

        // 1. Call your standalone path resolver
        const resolvedPath = await this.ResolveFile.resolveFilePath(
            owner,
            repo,
            baseBranch,
            filePath,
            accessToken,
        );

        // 2. Get the latest commit SHA of the base branch
        const baseRefUrl = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/ref/heads/${encodeURIComponent(baseBranch)}`;
        const baseRefRes = await fetch(baseRefUrl, { method: "GET", headers });

        if (!baseRefRes.ok) {
            const err = await baseRefRes.text();
            throw new Error(`Failed to fetch base branch '${baseBranch}': ${err}`);
        }

        const baseRefData = (await baseRefRes.json()) as { object: { sha: string } };
        const baseSha = baseRefData.object.sha;

        // 3. Create the new branch ref
        const createBranchUrl = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/refs`;
        const createBranchRes = await fetch(createBranchUrl, {
            method: "POST",
            headers,
            body: JSON.stringify({
                ref: `refs/heads/${branchName}`,
                sha: baseSha,
            }),
        });

        if (!createBranchRes.ok) {
            const err = await createBranchRes.text();
            throw new Error(`Failed to create branch '${branchName}': ${err}`);
        }

        // 4. Check if file already exists on the target path to obtain its SHA (required for updating existing files)
        let fileSha: string | undefined;
        const encodedPath = resolvedPath
            .split("/")
            .map((segment) => encodeURIComponent(segment))
            .join("/");

        const existingFileUrl = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${encodedPath}?ref=${encodeURIComponent(baseBranch)}`;

        try {
            const existingFileRes = await fetch(existingFileUrl, { method: "GET", headers });
            if (existingFileRes.ok) {
                const fileData = (await existingFileRes.json()) as { sha: string };
                fileSha = fileData.sha;
            }
        } catch {
            // File does not exist yet (creating a new file)
        }

        // 5. Create or update file on the new branch
        const updateFileUrl = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${encodedPath}`;

        const updateFileRes = await fetch(updateFileUrl, {
            method: "PUT",
            headers,
            body: JSON.stringify({
                message: commitMessage,
                content: Buffer.from(fileContent, "utf-8").toString("base64"),
                branch: branchName,
                ...(fileSha ? { sha: fileSha } : {}),
            }),
        });

        if (!updateFileRes.ok) {
            const err = await updateFileRes.text();
            throw new Error(`Failed to commit file content to branch '${branchName}': ${err}`);
        }

        // 6. Raise Pull Request
        const prUrl = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/pulls`;
        const prRes = await fetch(prUrl, {
            method: "POST",
            headers,
            body: JSON.stringify({
                title: prTitle,
                body: prDescription || "",
                head: branchName,
                base: baseBranch,
            }),
        });

        if (!prRes.ok) {
            const err = await prRes.text();
            throw new Error(`Branch updated, but failed to create PR: ${err}`);
        }

        const prData = (await prRes.json()) as { html_url: string; number: number };

        return {
            prUrl: prData.html_url,
            prNumber: prData.number,
            branch: branchName,
            path: resolvedPath,
        };
    }
}