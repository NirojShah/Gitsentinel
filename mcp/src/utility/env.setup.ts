import { config } from "dotenv";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

    const absulutePath = path.resolve(__dirname, "..", "env", file)

    config({
        path: absulutePath,
        quiet: true
    })
}

export default setupEnvironment;