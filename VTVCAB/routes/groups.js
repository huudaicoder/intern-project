import express from 'express';
import {
  createGroup,
  deleteGroup,
  getAllGroup,
  getGroup,
  updateGroup,
} from '../controllers/group.js';
import { verifyAdminToken } from '../utils/verifyToken.js';

const router = express.Router();

router.post('/', verifyAdminToken, createGroup);
router.get('/', getAllGroup);
router.get('/:id', getGroup);
router.put('/:id', verifyAdminToken, updateGroup);
router.delete('/:id', verifyAdminToken, deleteGroup);

export default router;
