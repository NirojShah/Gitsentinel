import { Router } from "express";
import type { Router as GitRouter, Request, Response } from "express";
import GitrepoRepository from "./git.repository.js";
import GitrepoServiceImplementation from "./git.service.js";
import Gitcontroller from "./git.controller.js";
import type AuthenticatedRequest from "../../constants/AuthenticatedRequest.type.js";

const gitRouter: GitRouter = Router();

const gitRepository = new GitrepoRepository();
const gitService = new GitrepoServiceImplementation(gitRepository);
const gitController = new Gitcontroller(gitService);

gitRouter.post("/", async (req: Request, res: Response) => await gitController.createGitrepo(req as AuthenticatedRequest, res));
gitRouter.get("/", async (req: Request, res: Response) => await gitController.getUsersGitrepoList(req as AuthenticatedRequest, res))
gitRouter.get("/:repoId", async (req: Request, res: Response) => await gitController.getUserGitrepo(req as AuthenticatedRequest, res))
gitRouter.put("/:repoId", async (req: Request, res: Response) => await gitController.updaeGitRepo(req as AuthenticatedRequest, res))

export default gitRouter;