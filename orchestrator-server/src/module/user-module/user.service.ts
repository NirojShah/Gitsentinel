import CustomError from "../../constants/CustomError.js";
import type ResponseDto from "../../constants/ResponseDto.js";
import StatusCode from "../../constants/StatusCode.js";
import type { Prisma } from "../../generated/prisma/client.js";
import AuthUtility from "../../utility/token.generate.js";
import type UserType from "./user.model.js";
import UserRepository from "./user.repository.js";
import bcrypt from "bcrypt";

class UserServiceImplementation {

    private userRepository = new UserRepository();

    async createUser(userData: Prisma.UserCreateInput): Promise<ResponseDto> {
        const userExists = await this.userRepository.userExistsByEmail(userData.email)
        if (userExists) {
            throw new CustomError(StatusCode.BAD_REQUEST, "User already exists.")
        }
        const hashedPassword = await bcrypt.hash(userData.password.toString(), 10);
        await this.userRepository.createuser({
            email: userData.email,
            username: userData.username,
            name: userData.name,
            password: hashedPassword,
        });

        return {
            statusCode: StatusCode.CREATED,
            message: "User signed up successfully."
        };
    }

    async loginUser(loginCredential: UserType.Login): Promise<ResponseDto> {
        const response = await this.userRepository.authenticateUser(
            loginCredential.email
        );

        if (!response) {
            throw new CustomError(
                StatusCode.UNAUTHORIZED,
                "Invalid email or password."
            );
        }

        const isPasswordValid = await bcrypt.compare(
            loginCredential.password,
            response.password
        );

        if (!isPasswordValid) {
            throw new CustomError(
                StatusCode.UNAUTHORIZED,
                "Invalid email or password."
            );
        }

        const tokenResponse = AuthUtility.generateToken({
            email: response.email,
            id: response.id
        });

        if (!tokenResponse.token) {
            throw new CustomError(
                StatusCode.INTERNAL_SERVER_ERROR,
                tokenResponse.message ?? "Failed to generate authentication token."
            );
        }

        return {
            statusCode: StatusCode.OK,
            message: "Login successful.",
            data: {
                token: tokenResponse.token
            }
        };
    }
}

export default UserServiceImplementation;