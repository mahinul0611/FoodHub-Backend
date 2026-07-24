import { Router } from "express";
import { chatController } from "./chat.controller";


const router = Router();

router.post("/", chatController.handleChatMessage);

export const ChatRoutes = router;