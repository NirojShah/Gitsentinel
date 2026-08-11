import express from "express"
import type { Request, Response, Express } from "express"
import cors from "cors"
import configureEnv from "./utility/env.config.js";

const rawEnv = process.env.NODE_ENV;

const curEnv: "prod" | "dev" | "test" =
    rawEnv === "prod" || rawEnv === "test" ? rawEnv : "dev";

configureEnv(curEnv)

const app: Express = express()

app.use(express.json())
app.use(cors())


export default app;