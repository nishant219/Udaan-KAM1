import {Router} from 'express';
import {recordInteraction, getKamDashboard, getLeadInteractions, reassignLead} from '../controllers/interactionController.js';
import auth from '../middleware/auth.js';
const interactionRouter = Router(); 

interactionRouter.post('/:leadId', auth,  recordInteraction);
interactionRouter.get('/dashboard', auth, getKamDashboard);
interactionRouter.get('/:leadId', auth, getLeadInteractions);
interactionRouter.patch('/:leadId', auth, reassignLead);

export default interactionRouter;