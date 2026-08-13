import express from "express"
import type { Request, Response, Express } from "express"
import cors from "cors"
import configureEnv from "./utility/env.config.js";
import GlobalErrorHandler from "./utility/GlobalErrorHandler.js";
import appRoute from "./route/app.route.js";

const rawEnv = process.env.NODE_ENV;

const curEnv: "prod" | "dev" | "test" =
    rawEnv === "prod" || rawEnv === "test" ? rawEnv : "dev";

configureEnv(curEnv)

const app: Express = express()

app.use(express.json())
app.use(cors())

app.use("/app/v1", appRoute)

app.use(GlobalErrorHandler)


export default app;