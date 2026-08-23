export class FetchFile {
    /**
     * Resolves a file path in a repository. If no directory is provided (e.g. 'authMiddleware.js'),
     * it searches the tree recursively—checking root first, then subdirectories.
     */
    async resolveFilePath(
        owner: string,
        repo: string,
        branch: string,
        path: string,
        accessToken: string
    ): Promise<string> {
        const trimmedPath = path.trim();

        // If path already contains slashes, return as-is
        if (trimmedPath.includes("/")) {
            return trimmedPath;
        }

        const treeUrl = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/trees/${encodeURIComponent(branch)}?recursive=1`;

        const response = await fetch(treeUrl, {
            method: "GET",
            headers: this.getHeaders(accessToken),
        });

        if (!response.ok) {
            return trimmedPath; // Fallback to raw path if tree fetch fails
        }

        const treeData = (await response.json()) as {
            tree: Array<{ path: string; type: string }>;
        };

        // 1. Check root directory first
        const rootMatch = treeData.tree.find(
            (item) => item.type === "blob" && item.path === trimmedPath
        );
        if (rootMatch) return rootMatch.path;

        // 2. Search subdirectories
        const subDirMatch = treeData.tree.find(
            (item) =>
                item.type === "blob" &&
                (item.path.endsWith(`/${trimmedPath}`) || item.path === trimmedPath)
        );

        return subDirMatch ? subDirMatch.path : trimmedPath;
    }

    /**
     * Fetches file content from GitHub using the API.
     */
    async fetchFileContent(
        owner: string,
        repo: string,
        branch: string,
        filePath: string,
        accessToken: string
    ) {
        const encodedPath = filePath
            .split("/")
            .map((segment) => encodeURIComponent(segment))
            .join("/");

        const contentUrl = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${encodedPath}?ref=${encodeURIComponent(branch)}`;

        const response = await fetch(contentUrl, {
            method: "GET",
            headers: this.getHeaders(accessToken),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`GitHub returned ${response.status}: ${errorText}`);
        }

        const data = (await response.json()) as {
            type: string;
            content?: string;
            name: string;
            path: string;
            sha: string;
            size: number;
            html_url?: string;
        };

        if (data.type !== "file") {
            throw new Error(`'${filePath}' is not a file. Type: '${data.type}'.`);
        }

        if (!data.content) {
            throw new Error(`GitHub returned no content for '${filePath}'.`);
        }

        const decodedContent = Buffer.from(
            data.content.replace(/\n/g, ""),
            "base64"
        ).toString("utf-8");

        return {
            path: data.path,
            name: data.name,
            sha: data.sha,
            size: data.size,
            content: decodedContent,
            url: data.html_url,
        };
    }

    /**
     * Helper to extract owner and repository name from a URL.
     */
    parseRepoUrl(repoUrl: string): { owner: string; repo: string } {
        const cleanRepoUrl = repoUrl.replace(/\.git$/, "").replace(/\/$/, "");
        const url = new URL(cleanRepoUrl);
        const parts = url.pathname.split("/").filter(Boolean);

        if (parts.length < 2) {
            throw new Error(`Invalid repository URL: ${repoUrl}`);
        }

        return { owner: parts[0], repo: parts[1] };
    }

    private getHeaders(accessToken: string): Record<string, string> {
        return {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "MCP-Git-Server",
        };
    }
}