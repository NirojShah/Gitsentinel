import jwt from "jsonwebtoken";
import type AuthType from "../constants/Auth.Type.js";

const getSecretKey = (): string => {
    const secretKey = process.env.JWT_KEY;

    if (!secretKey) {
        throw new Error("JWT secret key is not configured.");
    }

    return secretKey;
};

const generateToken = (data: AuthType.TokenData): AuthType.TokenGeneration => {
    try {
        const secretKey = getSecretKey();

        const token = jwt.sign(data, secretKey, {
            expiresIn: "1d"
        });

        return {
            token
        };
    } catch (err) {
        return {
            message: (err as Error).message
        };
    }
};

const compareToken = (token: string): AuthType.TokenCompare => {
    try {
        const secretKey = getSecretKey();

        const decodedToken = jwt.verify(token, secretKey);

        return {
            isAuthenticated: true,
            data: decodedToken as AuthType.TokenData
        };
    } catch (err) {
        return {
            isAuthenticated: false,
            data: null
        };
    }
};

const AuthUtility = {
    generateToken,
    compareToken
}

export default AuthUtility;