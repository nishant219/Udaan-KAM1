import { Router } from 'express';
import { getLeads, getLead, createLead, updateLeadStatus, deleteLead, getTodayCalls} from '../controllers/leadController.js';
import auth from '../middleware/auth.js';

const leadRouter = Router();

leadRouter.get('/', auth, getLeads); 
leadRouter.get('/:leadId', auth, getLead);
leadRouter.post('/', auth, createLead); 
leadRouter.patch('/:leadId', auth, updateLeadStatus); 
leadRouter.delete('/:leadId', auth, deleteLead); 
leadRouter.get('/today/calls', auth, getTodayCalls); 

export default leadRouter;
