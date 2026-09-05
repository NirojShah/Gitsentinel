namespace GitRepoModel {
    export type GitRepoList ={
        id: string,
        provider: string,
        repoUrl: string,
        baseBranch: string,
        createdAt: Date,
        userId: string
    }
}

export default GitRepoModel;