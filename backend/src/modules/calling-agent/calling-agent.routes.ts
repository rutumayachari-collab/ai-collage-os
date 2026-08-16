import { Router } from 'express';
import { callingAgentController } from './calling-agent.controller';

const router: Router = Router();

// Campaign lifecycle & CSV validation
router.post('/campaigns/validate-csv', callingAgentController.validateCSV);
router.post('/campaigns', callingAgentController.createCampaign);
router.get('/campaigns', callingAgentController.listCampaigns);
router.get('/campaigns/:id', callingAgentController.getCampaign);
router.post('/campaigns/:id/start', callingAgentController.startCampaign);
router.post('/campaigns/:id/pause', callingAgentController.pauseCampaign);
router.post('/campaigns/:id/import', callingAgentController.importStudents);
router.get('/campaigns/:id/queue', callingAgentController.getQueue);
router.get('/campaigns/:id/analytics', callingAgentController.getAnalytics);
router.get('/campaigns/:id/insights', callingAgentController.getCampaignAIInsights);

// Live calling studio & simulation turns
router.post('/calls/next', callingAgentController.getNextCall);
router.post('/calls/start', callingAgentController.startCallSession);
router.post('/calls/interact', callingAgentController.interactTurn);
router.post('/calls/:id/outcome', callingAgentController.recordOutcome);
router.post('/calls/:id/approve-action', callingAgentController.approveAction);
router.get('/calls/history', callingAgentController.getCallHistory);

// Do Not Call (DNC) suppression registry
router.get('/dnc', callingAgentController.getDncList);
router.post('/dnc', callingAgentController.addDnc);

export const callingAgentRoutes: Router = router;
