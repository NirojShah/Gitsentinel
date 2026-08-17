import { Response, Request } from "express";
import GitrepoServiceImplementation from "./git.service.js";
import type { GitRepoCreateInput, GitRepoUpdateInput } from "../../generated/prisma/models.js";
import type AuthenticatedRequest from "../../constants/AuthenticatedRequest.type.js";

class Gitcontroller {

    constructor(private readonly gitService: GitrepoServiceImplementation) {

    }

    async createGitrepo(req: AuthenticatedRequest, res: Response): Promise<Response> {
        const body = req.body as GitRepoCreateInput
        const userId = req.user.userId;
        const response = await this.gitService.createGitRepository(userId, body)
        return res.status(response.statusCode).json({
            data: response.data
        })
    }

    async getUserGitrepo(req: AuthenticatedRequest, res: Response): Promise<Response> {
        const repoId = req.params.repoId as string;
        const userId = req.user.userId;
        const response = await this.gitService.findGitRepoByid(repoId, userId);

        return res.status(response.statusCode).json({
            data: response.data
        })
    }

    async getUsersGitrepoList(req: AuthenticatedRequest, res: Response): Promise<Response> {
        const userId = req.user.userId;
        const response = await this.gitService.findAllGitReposByUserId(userId)
        return res.status(response.statusCode).json({
            data: response.data
        })
    }

    async updaeGitRepo(req: AuthenticatedRequest, res: Response): Promise<Response> {
        const userId = req.user.userId;
        const repoId = req.params.repoId as string;
        const repoBody = req.body as GitRepoUpdateInput;
        const response = await this.gitService.updateGitRepository(repoId, userId, repoBody)

        return res.status(response.statusCode).json({
            data: response.data
        })
    }

}

export default Gitcontroller;