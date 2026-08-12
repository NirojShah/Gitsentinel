import type { Prisma } from "../../generated/prisma/client.js";
import type UserType from "./user.model.js";
import UserRepository from "./user.repository.js";
import bcrypt from "bcrypt";

class UserServiceImplementation {
    private userRepository = new UserRepository();

    async createUser(userData: Prisma.UserCreateInput) {
        const hashedPassword = await bcrypt.hash(userData.passwordHash, 10);

        const response = await this.userRepository.createuser({
            ...userData,
            passwordHash: hashedPassword,
        });

        return response;
    }

    async loginUser(loginCredential: UserType.Login) {
        const response = await this.userRepository.loginUser(loginCredential);
        return response;
    }
}

export default UserServiceImplementation;