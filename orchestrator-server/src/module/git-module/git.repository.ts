import { prisma } from "../../../prisma/prisma.js";
import CustomError from "../../constants/CustomError.js";
import StatusCode from "../../constants/StatusCode.js";
import type { GitRepoCreateInput, GitRepoUpdateInput } from "../../generated/prisma/models.js";


class GitrepoRepository {
    private readonly gitRepo = prisma.gitRepo

    async createRepo(userId: string, repo: GitRepoCreateInput) {
        const repoUrl = repo.repoUrl;
        const repoUrlExists = await this.gitRepo.findFirst({
            where: {
                repoUrl: repoUrl,
            },
            select: {
                repoUrl: true,
                id: true
            }
        })
        if (repoUrlExists != null) {
            throw new CustomError(StatusCode.BAD_REQUEST, "Repo url already exists.")
        }

        return await this.gitRepo.create({
            data: {
                ...repo,
                user: {
                    connect: {
                        id: userId,
                    },
                },
            },
        });
    }

    async getRepoById(id: string, userId: string) {
        const repo = await this.gitRepo.findFirst({
            where: {
                id: id,
                userId: userId
            },
            select: {
                baseBranch: true,
                provider: true,
                repoUrl: true,
                userId: true
            }
        })

        if (repo == null) {
            throw new CustomError(StatusCode.NOT_FOUND, "Repository not exists.")
        }

        return repo;
    }

    async getAllRepoByUserId(userId: string) {
        return await this.gitRepo.findMany({
            where: {
                userId: userId
            },
            select: {
                baseBranch: true,
                provider: true,
                userId: true,
                repoUrl: true,
                id: true
            }
        })
    }

    async updateGitRepo(repoId: string, userId: string, repo: GitRepoUpdateInput) {
        const repoExists = await this.gitRepo.findFirst({
            where: {
                id: repoId,
                userId: userId
            },
            select: {
                baseBranch: true,
                provider: true,
                repoUrl: true,
                userId: true
            }
        })

        if (repoExists == null) {
            throw new CustomError(StatusCode.NOT_FOUND, `Repository not found with id - ${repoId}`)
        }

        return await this.gitRepo.update({
            where: {
                id: repoId
            },
            data: repo,
            select: {
                repoUrl: true,
                baseBranch: true,
                provider: true,
                userId: true
            }
        })
    }

    async deleteGitRepo(repoId: string, userId: string) {
        const repoExists = await this.gitRepo.findFirst({
            where: {
                id: repoId,
                userId: userId
            },
            select: {
                id: true
            }
        })

        if (repoExists == null) {
            throw new CustomError(
                StatusCode.NOT_FOUND,
                `Repository not found with id - ${repoId}`
            )
        }

        return await this.gitRepo.delete({
            where: {
                id: repoId
            }
        })
    }

}

export default GitrepoRepository;