interface GitRepositoryInterface {
    getRepoById(repoId: string): Promise<any>
    checkRepoExists(repoId: string): Promise<boolean>
    
}

export default GitRepositoryInterface;