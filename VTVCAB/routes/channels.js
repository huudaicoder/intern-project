import express from 'express';
import {
  createChannel,
  deleteChannel,
  getChannel,
  getChannels,
  updateChannel,
  getGroupChannels,
} from '../controllers/channel.js';
import { verifyAdminToken } from '../utils/verifyToken.js';

const router = express.Router();

// Create channel
router.post('/', verifyAdminToken, createChannel);
// Update channel
router.put('/:id', verifyAdminToken, updateChannel);
// Get all programs in a group
router.get('/find/:groupId', getGroupChannels);
// Delete channel
router.delete('/:id', verifyAdminToken, deleteChannel);
// Get a channel
router.get('/:id', getChannel);
// Get all channels
router.get('/', getChannels);

export default router;
