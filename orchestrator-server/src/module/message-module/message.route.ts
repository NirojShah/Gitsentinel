
import { Router } from "express";
import type { Router as RouterType, Request, Response } from "express";
import MessageController from "./message.controller.js";
import MessageService from "./message.service.js";
import MessageRepository from "./message.repository.js";
import { prisma } from "../../../prisma/prisma.js";
import type AuthenticatedRequest from "../../constants/AuthenticatedRequest.type.js";

const messageRoute: RouterType = Router();

const messageRepository = new MessageRepository(prisma);
const messageService = new MessageService(messageRepository);
const messageController = new MessageController(messageService);

messageRoute.post("/", async (req: Request, res: Response) => await messageController.sendMessage(req as AuthenticatedRequest, res))
messageRoute.delete("/:chatId", async (req: Request, res: Response) => await messageController.deleteMessage(req as AuthenticatedRequest, res))
messageRoute.get("/:chatId", async (req: Request, res: Response) => await messageController.fetchMessageByChatId(req as AuthenticatedRequest, res))

export default messageRoute;