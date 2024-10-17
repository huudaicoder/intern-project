import express from 'express';
import { checkAccessRight } from '../controllers/channel.js';
import {
  createProgram,
  deleteProgram,
  getProgram,
  getDailyPrograms,
  updateProgram,
  getCurrentProgram,
  deleteDayVideoProgram,
} from '../controllers/program.js';
import { verifyAdminToken, verifyUserToken } from '../utils/verifyToken.js';

const router = express.Router();

// Create program
router.post('/:channelId', verifyAdminToken, createProgram);
// Get all programs in a channel in a day
router.get('/find/:channelId', getDailyPrograms);
// Get current program in a channel
router.get(
  '/current/:channelId',
  checkAccessRight,
  verifyUserToken,
  getCurrentProgram
);
// Get a program in a channel
router.get('/:id', checkAccessRight, verifyUserToken, getProgram);
// Update program
router.put('/:id', verifyAdminToken, updateProgram);
// Delete program
router.delete('/:id', verifyAdminToken, deleteProgram);
// Delete all programs in a channel in a day
router.delete('/date/:channelId', verifyAdminToken, deleteDayVideoProgram);
export default router;
