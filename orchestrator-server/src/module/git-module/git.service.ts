import type ResponseDto from "../../constants/ResponseDto.js"
import GitrepoRepository from "./git.repository.js"
import type { Prisma } from "../../generated/prisma/client.js"
import StatusCode from "../../constants/StatusCode.js";
import CustomError from "../../constants/CustomError.js";
import { error } from "node:console";

class GitrepoServiceImplementation {

    constructor(private readonly gitRepo: GitrepoRepository) { }

    async createGitRepository(userId: string, gitRepoDetails: Prisma.GitRepoCreateInput): Promise<ResponseDto> {
        try {
            const repo = await this.gitRepo.createRepo(
                userId,
                gitRepoDetails
            );

            return {
                statusCode: StatusCode.CREATED,
                message: "Git repository created successfully.",
                data: repo
            };
        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            }

            throw new CustomError(StatusCode.INTERNAL_SERVER_ERROR, "Failed to create Git repository.");
        }
    }

    async findAllGitReposByUserId(userId: string): Promise<ResponseDto> {
        try {
            const repos = await this.gitRepo.getAllRepoByUserId(userId)
            return {
                statusCode: StatusCode.OK,
                data: repos
            }
        } catch (error) {
            if (error instanceof CustomError) {
                throw error
            }
            throw new CustomError(StatusCode.INTERNAL_SERVER_ERROR, "Failed to find all Repo By user")
        }
    }

    async findGitRepoByid(repoId: string, userId: string): Promise<ResponseDto> {
        try {
            const repo = await this.gitRepo.getRepoById(repoId, userId)
            return {
                statusCode: StatusCode.OK,
                data: repo
            }
        } catch (err) {
            if (err instanceof CustomError) {
                throw error;
            }
            return new CustomError(StatusCode.INTERNAL_SERVER_ERROR, "Failed to find git repo by UserId")
        }
    }

    async updateGitRepository(repoId: string, userId: string, repoDetails: Prisma.GitRepoUpdateInput): Promise<ResponseDto> {
        try {
            const resp = await this.gitRepo.updateGitRepo(repoId, userId, repoDetails)
            return {
                statusCode: StatusCode.OK,
                data: resp
            }
        } catch (error) {
            if (error instanceof CustomError) {
                throw error
            }
            return new CustomError(StatusCode.INTERNAL_SERVER_ERROR, "Failed to update the repo details.")
        }
    }

}

export default GitrepoServiceImplementation