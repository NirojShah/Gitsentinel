import { config } from "dotenv";

const setupEnvironment = (current_environment: "dev" | "prod" | "test") => {
    let file = ".env.example"

    switch (current_environment) {
        case "dev": {
            file = ".env.development"
            break;
        }
        case "prod": {
            file = ".env.production"
            break;
        }
        case "test": {
            file = ".env.testing"
            break;
        }
    }

    config({
        path: `../env/${file}`,
        quiet: true
    })
}

export default setupEnvironment;