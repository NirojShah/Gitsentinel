namespace UserType {
    export type User = {
        email: string,
        username: string,
        name: string,
        passworrdHash: string,
        isActive: boolean,
        isVerified: Boolean
    }

    export type Login = {
        email: string,
        password: string
    }
}

export default UserType;