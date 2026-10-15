import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { defer, type Observable } from "rxjs";


export type CreateRepoConfig = {
    provider: "GITHUB" | "GITLAB" | "BITBUCKET",
    repoUrl: string,
    accessToken: string,
    baseBranch: string
}

export type RepoConfig = {
    id: string,
    provider: "GITHUB" | "GITLAB" | "BITBUCKET",
    repoUrl: string,
    baseBranch: string,
    userId: string
}

interface RepoListResponse {
    data: RepoConfig[];
}

interface RepoCreateResponse {
    data: RepoConfig;
}

@Injectable({
    providedIn: 'root'
})

class RepoConfigService {

    apiUrl = "http://localhost:5000/app/v1/git";
    constructor(private readonly httpClient: HttpClient) {

    }

    getConfiguredRepositories(): Observable<RepoListResponse> {
        return defer(() => {
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("You must be signed in to load repositories.");
            }

            return this.httpClient.get<RepoListResponse>(this.apiUrl, {
                headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
            });
        });
    }

    createRepoConfig(config: CreateRepoConfig): Observable<RepoCreateResponse> {
        return defer(() => {
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("You must be signed in to configure a repository.");
            }

            return this.httpClient.post<RepoCreateResponse>(this.apiUrl, config, {
                headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
            });
        });
    }

}

export default RepoConfigService;
