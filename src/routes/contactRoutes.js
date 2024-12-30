import {Router} from 'express';
import {addContact, getContacts} from '../controllers/contactController.js';

import auth from '../middleware/auth.js';

const contactRouter = Router();

contactRouter.post('/:leadId', auth, addContact);
contactRouter.get('/', auth, getContacts);

export default contactRouter;