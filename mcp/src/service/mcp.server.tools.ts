import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { z } from "zod";
import GitRepository from "../repository/git.repository.js";
import { FetchFile } from "../service-actions/resolve.file.js";
import type { privateDecrypt } from "node:crypto";
import { RaisePrService } from "../service-actions/raisepr.service.js";

class Mcptools {
    constructor(
        private readonly server: McpServer,
        private readonly gitRepository: GitRepository,
        private readonly githubService: FetchFile = new FetchFile(),
        private readonly raisePrService: RaisePrService = new RaisePrService()

    ) { }

    RegisterGitFileFetch(): void {
        this.server.registerTool(
            "githubfilefetch",
            {
                title: "github file fetch",
                description:
                    "Fetch a file from a GitHub repository for updates and comparison.",
                inputSchema: z.object({
                    path: z.string().describe("Path or filename of the file"),
                    branch: z.string().optional().describe("Branch name"),
                    repositoryId: z.string().describe("Repository ID"),
                }),
            },
            async (args) => {
                const { path, branch, repositoryId } = args;

                try {
                    // 1. Validate repository
                    const isRepoExists = await this.gitRepository.checkRepoExists(repositoryId);
                    if (!isRepoExists) {
                        return {
                            isError: true,
                            content: [{ type: "text", text: `Repository ${repositoryId} does not exist` }],
                        };
                    }

                    const repoDetails = await this.gitRepository.getRepoById(repositoryId);
                    if (!repoDetails) {
                        return {
                            isError: true,
                            content: [{ type: "text", text: `Repository details not found for ${repositoryId}` }],
                        };
                    }

                    // 2. Extract repository metadata & branch
                    const { owner, repo } = this.githubService.parseRepoUrl(repoDetails.repoUrl);
                    const targetBranch = branch?.trim() || repoDetails.baseBranch || "main";

                    // 3. Auto-resolve path (find in subdirectories if needed)
                    const resolvedPath = await this.githubService.resolveFilePath(
                        owner,
                        repo,
                        targetBranch,
                        path,
                        repoDetails.accessToken
                    );

                    // 4. Fetch file data
                    const fileData = await this.githubService.fetchFileContent(
                        owner,
                        repo,
                        targetBranch,
                        resolvedPath,
                        repoDetails.accessToken
                    );

                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(
                                    {
                                        repository: `${owner}/${repo}`,
                                        branch: targetBranch,
                                        ...fileData,
                                    },
                                    null,
                                    2
                                ),
                            },
                        ],
                    };
                } catch (error) {
                    return {
                        isError: true,
                        content: [
                            {
                                type: "text",
                                text: `Error fetching GitHub file: ${error instanceof Error ? error.message : String(error)
                                    }`,
                            },
                        ],
                    };
                }
            }
        );
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

                try {
                    // 1. Verify repo exists
                    const isRepoExists = await this.gitRepository.checkRepoExists(repositoryId);
                    if (!isRepoExists) {
                        return {
                            isError: true,
                            content: [{ type: "text", text: `Repository ${repositoryId} does not exist` }],
                        };
                    }

                    const repoDetails = await this.gitRepository.getRepoById(repositoryId);
                    if (!repoDetails) {
                        return {
                            isError: true,
                            content: [{ type: "text", text: `Repository details not found for ${repositoryId}` }],
                        };
                    }

                    // 2. Extract repository metadata
                    const { owner, repo } = this.githubService.parseRepoUrl(repoDetails.repoUrl);
                    const targetBaseBranch = baseBranch || repoDetails.baseBranch || "main";

                    // 3. Delegate execution to GithubService
                    const result = await this.raisePrService.createBranchCommitAndRaisePr({
                        owner,
                        repo,
                        baseBranch: targetBaseBranch,
                        branchName: branchName.trim(),
                        filePath,
                        fileContent,
                        commitMessage,
                        prTitle,
                        prDescription,
                        accessToken: repoDetails.accessToken,
                    });

                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(
                                    {
                                        message: `Successfully created branch '${result.branch}' and raised PR #${result.prNumber}`,
                                        pullRequestUrl: result.prUrl,
                                        filePath: result.path,
                                    },
                                    null,
                                    2
                                ),
                            },
                        ],
                    };
                } catch (error) {
                    return {
                        isError: true,
                        content: [
                            {
                                type: "text",
                                text: `Failed to commit and raise PR: ${error instanceof Error ? error.message : String(error)
                                    }`,
                            },
                        ],
                    };
                }
            }
        );
    }
}

export default Mcptools;