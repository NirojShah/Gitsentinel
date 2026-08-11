import express from "express"
import type { Express } from "express"
import http, { type Server } from "node:http"
import app from "./app.js";

const server: Server = http.createServer(app);

const PORT: number = Number(process.env.PORT) || 5000;

server.listen(PORT, "127.0.0.1", () => {
    console.log("SERVER STARTED AT PORT - " + PORT);
})