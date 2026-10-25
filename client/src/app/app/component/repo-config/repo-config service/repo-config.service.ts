import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { defer, type Observable } from "rxjs";
import { API_BASE_URL } from "../../../core/api-base-url";

export type CreateRepoConfig = {
    provider: "GITHUB" | "GITLAB" | "BITBUCKET",
    repoUrl: string,
    accessToken: string,
    baseBranch: string
}

export type UpdateRepoConfig = Partial<CreateRepoConfig>;

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
    apiUrl = `${API_BASE_URL}/git`;

    constructor(private readonly httpClient: HttpClient) {}

    private authorizationHeaders(): HttpHeaders {
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("You must be signed in to manage repositories.");
        }
        return new HttpHeaders({ Authorization: `Bearer ${token}` });
    }

    getConfiguredRepositories(): Observable<RepoListResponse> {
        return defer(() =>
            this.httpClient.get<RepoListResponse>(this.apiUrl, {
                headers: this.authorizationHeaders(),
            }),
        );
    }

    getRepository(repoId: string): Observable<RepoCreateResponse> {
        return defer(() =>
            this.httpClient.get<RepoCreateResponse>(
                `${this.apiUrl}/${encodeURIComponent(repoId)}`,
                { headers: this.authorizationHeaders() },
            ),
        );
    }

    createRepoConfig(config: CreateRepoConfig): Observable<RepoCreateResponse> {
        return defer(() =>
            this.httpClient.post<RepoCreateResponse>(this.apiUrl, config, {
                headers: this.authorizationHeaders(),
            }),
        );
    }

    updateRepoConfig(repoId: string, config: UpdateRepoConfig): Observable<RepoCreateResponse> {
        return defer(() =>
            this.httpClient.put<RepoCreateResponse>(
                `${this.apiUrl}/${encodeURIComponent(repoId)}`,
                config,
                { headers: this.authorizationHeaders() },
            ),
        );
    }
}

export default RepoConfigService;
