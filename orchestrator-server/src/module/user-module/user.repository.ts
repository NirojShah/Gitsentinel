import UserType from "./user.model.js";
import { prisma } from "../../../prisma/prisma.js"
import type { Prisma } from "../../generated/prisma/client.js";
import CustomError from "../../constants/CustomError.js";
import StatusCode from "../../constants/StatusCode.js";

class UserRepository {
    async createuser(userBody: Prisma.UserCreateInput) {
        const userExists = await prisma.user.findFirst({
            where: {
                email: userBody.email
            },
            select: {
                email: true
            }
        })

        if (userExists) {
            throw new CustomError(StatusCode.BAD_REQUEST, "User already present please Login")
        }
        prisma.user.create({
            data: userBody
        })

        return {
            status: StatusCode.CREATED,
            message: "User is created successfully."
        }
    }

    async loginUser(loginCredential: UserType.Login) {

    }
}

export default UserRepository;



// async loginUser(loginCredential: UserType.Login) {
//     const user = await this.userRepository.findByEmail(
//         loginCredential.email
//     );

//     if (!user) {
//         throw new CustomError(
//             StatusCode.UNAUTHORIZED,
//             "Invalid email or password"
//         );
//     }

//     const isPasswordValid = await bcrypt.compare(
//         loginCredential.password,
//         user.password
//     );

//     if (!isPasswordValid) {
//         throw new CustomError(
//             StatusCode.UNAUTHORIZED,
//             "Invalid email or password"
//         );
//     }

//     return user;
// }