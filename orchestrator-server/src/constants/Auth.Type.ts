namespace AuthType {
    export type TokenData = {
        id: string;
        email: string;
    };

    export type TokenGeneration = {
        token?: string;
        message?: string;
    };

    export type TokenCompare = {
        isAuthenticated: boolean;
        data?: TokenData | null;
    };
}

export default AuthType;