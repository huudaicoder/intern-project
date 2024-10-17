import express from 'express';
import {
  loginAdmin,
  logoutAdmin,
  getAllAdmin,
  createAdmin,
  updateAdmin,
} from '../controllers/admin.js';
import { verifyAdmin, verifyAdminToken } from '../utils/verifyToken.js';

const router = express.Router();

router.post('/login', loginAdmin);
router.get('/logout', verifyAdminToken, logoutAdmin);
router.get('/', verifyAdminToken, getAllAdmin);
router.post('/', verifyAdminToken, createAdmin);
router.put('/:id', verifyAdmin, updateAdmin);

export default router;
