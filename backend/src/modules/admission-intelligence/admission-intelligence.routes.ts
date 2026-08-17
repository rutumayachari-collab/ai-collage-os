import { Router } from 'express';
import { admissionIntelligenceController } from './admission-intelligence.controller';

const router: Router = Router();

router.get('/overview', admissionIntelligenceController.getOverview);
router.get('/leads', admissionIntelligenceController.getTopLeads);
router.get('/follow-ups', admissionIntelligenceController.getFollowUpQueue);
router.get('/student/:studentId', admissionIntelligenceController.getStudentIntelligence);
router.get('/campaigns/:campaignId/insights', admissionIntelligenceController.getCampaignInsights);
router.get('/courses', admissionIntelligenceController.getCourseDemand);
router.get('/questions', admissionIntelligenceController.getCommonQuestions);
router.get('/objections', admissionIntelligenceController.getCommonObjections);
router.get('/ai-summary', admissionIntelligenceController.getAICampaignSummary);
router.get('/recommendations', admissionIntelligenceController.getActionRecommendations);
router.get('/funnel', admissionIntelligenceController.getAdmissionFunnel);
router.get('/bottlenecks', admissionIntelligenceController.getBottleneckAnalysis);
router.post('/what-if', admissionIntelligenceController.getWhatIfSimulation);
router.post('/search', admissionIntelligenceController.globalSearch);

export const admissionIntelligenceRoutes: Router = router;
