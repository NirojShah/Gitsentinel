import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { z } from "zod"

class Mcptools {
    RegisterGitFileFetch(server: McpServer): void {
        server.registerTool("github file fetch", {
            title: "github file fetch",
            description: "github file fetch for the updates and for the comparision.",
            inputSchema: z.object({
                owner: z.string().describe("GitHub repository owner"),
                repo: z.string().describe("GitHub repository name"),
                path: z.string().describe("Path of the file"),
                branch: z.string().optional().describe("Branch name"),

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

    registGitCommitAndPrRaise(): void {

    }
}