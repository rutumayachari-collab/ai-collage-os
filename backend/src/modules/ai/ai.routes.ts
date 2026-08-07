import { Router } from 'express';
import { aiController } from './ai.controller';

const router: Router = Router();

router.post('/summary', aiController.generateSummary);
router.post('/eligibility', aiController.checkEligibility);
router.post('/risk-analysis', aiController.analyzeRisk);
router.post('/scholarship-recommendation', aiController.recommendScholarships);
router.post('/counseling-notes', aiController.generateCounselingNotes);
router.post('/admission-email', aiController.generateAdmissionEmail);
router.post('/whatsapp-draft', aiController.generateWhatsAppDraft);
router.post('/next-action', aiController.recommendNextAction);

export const aiRoutes: Router = router;
