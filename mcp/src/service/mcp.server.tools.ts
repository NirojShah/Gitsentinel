import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { z } from "zod"

class Mcptools {
    constructor(private readonly server: McpServer) {

    }
    RegisterGitFileFetch(): void {
        this.server.registerTool("github file fetch", {
            title: "github file fetch",
            description: "github file fetch for the updates and for the comparision.",
            inputSchema: z.object({
                owner: z.string().describe("GitHub repository owner"),
                repo: z.string().describe("GitHub repository name"),
                path: z.string().describe("Path of the file"),
                branch: z.string().optional().describe("Branch name"),
                repositoryId: z.string().describe("RepoId is required.")
            })
        }, async (args) => {
            const { owner, repo, path, branch } = args;
            console.log({ owner, repo, path, branch })
            return {
                content: [
                    {
                        type: "text",
                        text: "this is teh test data."
                    }
                ]
            }
        })
    }

    registerGitCommitAndPrRaise(): void {
        this.server.registerTool(
            "git_commit_and_raise_pr",
            {
                title: "Git Commit and Raise PR",
                description:
                    "Create a branch, update a file in a GitHub repository, commit the changes, push the branch, and create a pull request.",
                inputSchema: z.object({
                    repositoryId: z.string().describe("Internal repository ID"),
                    baseBranch: z.string().default("main").describe("Target branch for the pull request"),
                    branchName: z.string().describe("Name of the new branch to create"),
                    filePath: z.string().describe("Path of the file to create or update"),
                    fileContent: z.string().describe("New content of the file"),
                    commitMessage: z.string().describe("Git commit message"),
                    prTitle: z.string().describe("Pull request title"),
                    prDescription: z.string().optional().describe("Pull request description"),
                }),
            },
            async (args) => {
                const {
                    repositoryId, baseBranch, branchName,
                    filePath, fileContent, commitMessage,
                    prTitle, prDescription,
                } = args;

                console.log({
                    repositoryId, baseBranch, branchName, filePath, fileContent, commitMessage, prTitle, prDescription,
                });

                // TODO:
                // 1. Get base branch
                // 2. Create branch
                // 3. Get existing file (if updating)
                // 4. Create/update file
                // 5. Commit changes
                // 6. Create PR

                return {
                    content: [
                        {
                            type: "text",
                            text: `Successfully created branch ${branchName} and raised PR.`,
                        },
                    ],
                };
            },
        );
    }


    RegisterFetchFileTESTING(): void {
        this.server.registerTool(
            "github_file_fetch",
            {
                title: "GitHub File Fetch",
                description:
                    "Fetch a file from a GitHub repository for updates and comparison. " +
                    "An exact path or filename can be provided. If the exact path is not found, " +
                    "the repository tree will be searched by filename.",
                inputSchema: z.object({
                    owner: z.string().describe("GitHub repository owner"),
                    repo: z.string().describe("GitHub repository name"),
                    path: z.string().optional().describe(
                        "File path or filename, for example 'model/blog.js' or 'blog.js'. " +
                        "If omitted, the repository file list will be returned.",
                    ),

                    branch: z.string().optional().describe(
                        "Git branch name. If omitted, the repository default branch is used.",
                    ),

                    token: z.string().describe("GitHub Personal Access Token"),
                }),
            },

            async (args) => {
                const { owner, repo, path, branch, token, } = args;

                try {
                    // ---------------------------------------------------------
                    // 1. Validate token
                    // ---------------------------------------------------------

                    if (!token) {
                        return {
                            isError: true,
                            content: [
                                {
                                    type: "text",
                                    text: "GitHub token is required.",
                                },
                            ],
                        };
                    }

                    // ---------------------------------------------------------
                    // 2. GitHub headers
                    // ---------------------------------------------------------

                    const headers = {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/vnd.github+json",
                        "X-GitHub-Api-Version": "2022-11-28",
                        "User-Agent": "MCP-Git-Server",
                    };

                    // ---------------------------------------------------------
                    // 3. Get repository information
                    // ---------------------------------------------------------

                    const repoUrl = `https://api.github.com/repos/` + `${encodeURIComponent(owner)}/` + `${encodeURIComponent(repo)}`;

                    const repoResponse = await fetch(repoUrl, {
                        method: "GET",
                        headers,
                    });

                    if (!repoResponse.ok) {
                        const errorText = await repoResponse.text();

                        return {
                            isError: true,
                            content: [
                                {
                                    type: "text",
                                    text:
                                        `Failed to access repository ` +
                                        `${owner}/${repo}. ` +
                                        `GitHub returned ${repoResponse.status}: ${errorText}`,
                                },
                            ],
                        };
                    }

                    const repoData = (await repoResponse.json()) as {
                        default_branch: string;
                        full_name: string;
                    };

                    const targetBranch =
                        branch?.trim() || repoData.default_branch;

                    // ---------------------------------------------------------
                    // 4. Fetch repository tree
                    //
                    const treeUrl = `https://api.github.com/repos/` + `${encodeURIComponent(owner)}/` + `${encodeURIComponent(repo)}/git/trees/` + `${encodeURIComponent(targetBranch)}?recursive=1`;

                    const treeResponse = await fetch(treeUrl, {
                        method: "GET",
                        headers,
                    });

                    if (!treeResponse.ok) {
                        const errorText = await treeResponse.text();

                        return {
                            isError: true,
                            content: [
                                {
                                    type: "text",
                                    text:
                                        `Failed to fetch repository tree for ` +
                                        `${owner}/${repo} on branch ${targetBranch}. ` +
                                        `GitHub returned ${treeResponse.status}: ${errorText}`,
                                },
                            ],
                        };
                    }

                    const treeData = (await treeResponse.json()) as {
                        sha: string;
                        truncated?: boolean;
                        tree: Array<{
                            path: string; mode: string; type: string; sha: string; size?: number; url: string;
                        }>;
                    };

                    const files = treeData.tree.filter(
                        (item) => item.type === "blob",
                    );

                    // ---------------------------------------------------------
                    // 5. Resolve requested file
                    // ---------------------------------------------------------

                    let targetPath = path?.trim();

                    // ---------------------------------------------------------
                    // No path supplied
                    // ---------------------------------------------------------

                    if (!targetPath) {
                        const fileList = files
                            .map((file) => file.path)
                            .slice(0, 100);

                        return {
                            content: [
                                {
                                    type: "text",
                                    text: [
                                        `No file path was provided.`,
                                        "",
                                        `Repository: ${owner}/${repo}`,
                                        `Branch: ${targetBranch}`,
                                        "",
                                        treeData.truncated
                                            ? "WARNING: GitHub returned a truncated repository tree."
                                            : "",
                                        `Available files (${fileList.length} shown):`,
                                        "",
                                        ...fileList,
                                    ]
                                        .filter(Boolean)
                                        .join("\n"),
                                },
                            ],
                        };
                    }

                    // ---------------------------------------------------------
                    // 6. Try exact path first
                    //
                    const exactMatch = files.find(
                        (file) => file.path === targetPath,
                    );

                    if (exactMatch) {
                        targetPath = exactMatch.path;

                        console.log(
                            `Exact file match found: ${targetPath}`,
                        );
                    } else {
                        const fileName = targetPath
                            .split("/")
                            .pop();

                        if (!fileName) {
                            return {
                                isError: true,
                                content: [
                                    {
                                        type: "text",
                                        text:
                                            `Invalid file path: '${targetPath}'.`,
                                    },
                                ],
                            };
                        }

                        const matches = files.filter(
                            (file) =>
                                file.path === fileName ||
                                file.path.endsWith(`/${fileName}`),
                        );

                        // -----------------------------------------------------
                        // No matches
                        // -----------------------------------------------------

                        if (matches.length === 0) {
                            return {
                                isError: true,
                                content: [
                                    {
                                        type: "text",
                                        text: [
                                            `File '${targetPath}' was not found.`,
                                            "",
                                            `Repository: ${owner}/${repo}`,
                                            `Branch: ${targetBranch}`,
                                            "",
                                            `No file named '${fileName}' exists in the repository.`,
                                        ].join("\n"),
                                    },
                                ],
                            };
                        }

                        // -----------------------------------------------------
                        // Multiple matches
                        // -----------------------------------------------------

                        if (matches.length > 1) {
                            return {
                                content: [
                                    {
                                        type: "text",
                                        text: [
                                            `Multiple files matched '${fileName}'.`,
                                            "",
                                            `Repository: ${owner}/${repo}`,
                                            `Branch: ${targetBranch}`,
                                            "",
                                            "Possible files:",
                                            "",
                                            ...matches.map(
                                                (file, index) =>
                                                    `${index + 1}. ${file.path}`,
                                            ),
                                            "",
                                            "Please provide the exact file path.",
                                        ].join("\n"),
                                    },
                                ],
                            };
                        }

                        // -----------------------------------------------------
                        // Exactly one match
                        // -----------------------------------------------------

                        targetPath = matches[0].path;

                        console.log(
                            `Filename match found: ${targetPath}`,
                        );
                    }

                    // ---------------------------------------------------------
                    // 8. Fetch actual file content
                    // ---------------------------------------------------------

                    const encodedPath = targetPath
                        .split("/")
                        .map((segment) => encodeURIComponent(segment))
                        .join("/");

                    const contentUrl =
                        `https://api.github.com/repos/` +
                        `${encodeURIComponent(owner)}/` +
                        `${encodeURIComponent(repo)}/contents/` +
                        `${encodedPath}` +
                        `?ref=${encodeURIComponent(targetBranch)}`;

                    console.log(
                        `Fetching GitHub file: ${targetPath}`,
                    );

                    const contentResponse = await fetch(contentUrl, {
                        method: "GET",
                        headers,
                    });

                    if (!contentResponse.ok) {
                        const errorText = await contentResponse.text();

                        return {
                            isError: true,
                            content: [
                                {
                                    type: "text",
                                    text:
                                        `Failed to fetch file '${targetPath}'. ` +
                                        `GitHub returned ${contentResponse.status}: ${errorText}`,
                                },
                            ],
                        };
                    }

                    // ---------------------------------------------------------
                    // 9. Parse GitHub response
                    // ---------------------------------------------------------

                    const data = (await contentResponse.json()) as {
                        type: string;
                        encoding?: string;
                        content?: string;
                        name: string;
                        path: string;
                        sha: string;
                        size: number;
                        html_url?: string;
                    };

                    // ---------------------------------------------------------
                    // 10. Validate file
                    // ---------------------------------------------------------

                    if (data.type !== "file") {
                        return {
                            isError: true,
                            content: [
                                {
                                    type: "text",
                                    text:
                                        `'${targetPath}' is not a file. ` +
                                        `GitHub returned type '${data.type}'.`,
                                },
                            ],
                        };
                    }

                    if (!data.content) {
                        return {
                            isError: true,
                            content: [
                                {
                                    type: "text",
                                    text:
                                        `GitHub returned no content for ` +
                                        `'${targetPath}'.`,
                                },
                            ],
                        };
                    }

                    // ---------------------------------------------------------
                    // 11. Decode Base64 content
                    // ---------------------------------------------------------

                    const fileContent = Buffer.from(
                        data.content.replace(/\n/g, ""),
                        "base64",
                    ).toString("utf-8");

                    // ---------------------------------------------------------
                    // 12. Return file
                    // ---------------------------------------------------------

                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(
                                    {
                                        repository: `${owner}/${repo}`,
                                        branch: targetBranch,
                                        path: data.path,
                                        name: data.name,
                                        sha: data.sha,
                                        size: data.size,
                                        content: fileContent,
                                        url: data.html_url,
                                    },
                                    null,
                                    2,
                                ),
                            },
                        ],
                    };
                } catch (error) {
                    console.error(
                        "GitHub file fetch error:",
                        error instanceof Error
                            ? error.message
                            : String(error),
                    );

                    return {
                        isError: true,
                        content: [
                            {
                                type: "text",
                                text:
                                    `Error fetching GitHub file: ` +
                                    `${error instanceof Error
                                        ? error.message
                                        : String(error)}`,
                            },
                        ],
                    };
                }
            },
        );
    }
}

export default Mcptools