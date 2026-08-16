import { Response, Request } from "express";
import GitrepoServiceImplementation from "./git.service.js";
import type { GitRepoCreateInput, GitRepoUpdateInput } from "../../generated/prisma/models.js";

class Gitcontroller {

    constructor(private readonly gitService: GitrepoServiceImplementation) {

    }

    async createGitrepo(req: Request, res: Response): Promise<Response> {
        const body = req.body as GitRepoCreateInput
        const userId = req.user.userId;
        const response = await this.gitService.createGitRepository(userId, body)
        return res.status(response.statusCode).json({
            data: response.data
        })
    }

    async getUserGitrepo(req: Request, res: Response): Promise<Response> {
        const repoId = req.params.repoId;
        const userId = req.user.userId;
        const response = await this.gitService.findGitRepoByid(repoId, userId)

        return res.status(response.statusCode).json({
            data: response.data
        })
    }

    async getUsersGitrepoList(req: Request, res: Response): Promise<Response> {
        const userId = req.user.userId;
        const response = await this.gitService.findAllGitReposByUserId(userId)
        return res.status(response.statusCode).json({
            data: response.data
        })
    }

    async updaeGitRepo(req: Request, res: Response): Promise<Response> {
        const userId = req.user.userId;
        const repoId = req.params.repoId;
        const repoBody = req.body as GitRepoUpdateInput;
        const response = await this.gitService.updateGitRepository(repoId, userId, repoBody)

        return res.status(response.statusCode).json({
            data: response.data
        })
    }

}

export default Gitcontroller;