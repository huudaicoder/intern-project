import express from 'express';
import {
  loginUser,
  logoutUser,
  getAllUser,
  getUser,
  updateUser,
  createUser,
} from '../controllers/user.js';
import {
  verifyAdminToken,
  verifyUserToken,
  verifyAdminOrUser,
} from '../utils/verifyToken.js';

const router = express.Router();

router.post('/', createUser);
router.post('/login', loginUser);
router.get('/logout', verifyUserToken, logoutUser);
router.get('/', verifyAdminToken, getAllUser);
router.get('/:id', verifyAdminOrUser, getUser);
router.put('/:id', verifyAdminOrUser, updateUser);

export default router;
