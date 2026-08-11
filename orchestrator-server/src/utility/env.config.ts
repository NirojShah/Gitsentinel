import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Get the current file's directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function configureEnv(curEnv: "dev" | "prod" | "test"): void {
    let fileName = ".env.development";

    switch (curEnv) {
        case "dev":
            fileName = ".env.development";
            break;
        case "test":
            fileName = ".env.testing";
            break;
        case "prod":
            fileName = ".env.production";
            break;
        default:
            fileName = ".env.development";
            break;
    }

    const absolutePath = path.resolve(__dirname, "..", "env", fileName);

    dotenv.config({
        path: absolutePath,
        debug: false
    });

    console.log("Loaded configurations successfully.");
}

export default configureEnv;
