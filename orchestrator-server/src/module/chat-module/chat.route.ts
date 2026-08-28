import { Router, Request, Response } from "express";
import ChatController from "./chat.controller.js";
import ChatServiceImpl from "./chat.service.js";
import type AuthenticatedRequest from "../../constants/AuthenticatedRequest.type.js";


const chatRouter = Router();

const chatService = new ChatServiceImpl()
const chatController = new ChatController(chatService)

chatRouter.post("/", async (req: Request, res: Response) => chatController.createChat(req as AuthenticatedRequest, res))
chatRouter.patch("/:chatId", async (req: Request, res: Response) => chatController.updateChat(req as AuthenticatedRequest, res))
chatRouter.get("/", async (req: Request, res: Response) => chatController.findChat(req as AuthenticatedRequest, res))
chatRouter.get("/:chatId", async (req: Request, res: Response) => chatController.findChat(req as AuthenticatedRequest, res))

export default chatRouter;