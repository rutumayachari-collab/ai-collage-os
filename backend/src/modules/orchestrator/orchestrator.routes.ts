import { Router } from "express";
import { orchestratorController } from "./orchestrator.controller";

const router = Router();

router.get("/workflows", orchestratorController.listWorkflows);
router.get("/workflows/:id", orchestratorController.getWorkflow);
router.post("/workflows", orchestratorController.createWorkflow);
router.post("/workflows/:id/actions/:actionId/execute", orchestratorController.executeAction);
router.get("/workflows/:id/history", orchestratorController.getHistory);
router.post("/workflows/:id/escalate", orchestratorController.escalate);

export const orchestratorRoutes: typeof router = router;
