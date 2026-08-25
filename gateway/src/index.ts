import type { Request, Response } from "express"
import express from "express"
import http from "node:http"



const app = express()

const server = http.createServer(app)

function __main() {
    const PORT: number = Number(process.env.PORT) || 5050;

    server.listen(PORT, () => {
        console.log(`SERVER RUNNING ON PORT - ${PORT}`)
    })
}

__main()