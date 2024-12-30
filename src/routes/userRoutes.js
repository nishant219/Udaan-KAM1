import { Router } from 'express';
import {
  createUser,
  login,
  updateUser,
  getUserProfile,
  transferLeads,
  deactivateUser,
  listUsers,
} from '../controllers/userController.js';
import auth from '../middleware/auth.js';

const userRouter = Router();

userRouter.post('/', createUser); 
userRouter.post('/login', login);
userRouter.patch('/:id', auth, updateUser);
userRouter.get('/:id', auth, getUserProfile);
userRouter.post('/transfer-leads/:fromUserId/:toUserId', auth, transferLeads);
userRouter.patch('/deactivate/:id', auth, deactivateUser);
userRouter.get('/', auth, listUsers);

export default userRouter;
