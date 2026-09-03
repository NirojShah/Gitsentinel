import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";


export type CreateRepoConfig = {
    provider: "GITHUB" | "GITLAB" | "BITBUCKET",
    repoUrl: string,
    accessToken: string,
    baseBranch: string
}

export type RepoConfig = {
    provider: "GITHUB" | "GITLAB" | "BITBUCKET",
    repoUrl: string,
    baseBranch: string,
    createdAt: Date,
    userId: string
}

@Injectable({
    providedIn: 'root'
})

class RepoConfigService {

    apiUrl = "http://localhost:5000/app/v1/git";
    constructor(private readonly httpClient: HttpClient) {

    }

    async createRepoConfig(config: CreateRepoConfig) {
        const toke = localStorage.getItem("token");

        const resp = this.httpClient.post(this.apiUrl, config, {
            headers: {
                Authorization: `Bearer ${toke}`
            }
        })
        // return resp as RepoConfig;
    }

}

export default RepoConfigService;
