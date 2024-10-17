import Group from '../models/Group.js';
import Channel from '../models/Channel.js';
import { createError } from '../utils/error.js';

// Create Group
export const createGroup = async (req, res, next) => {
  const newGroup = new Group(req.body);
  try {
    await newGroup.save();
    res.status(200).json('Group has been created.');
  } catch (err) {
    next(err);
  }
};

// Read all Group
export const getAllGroup = async (req, res, next) => {
  try {
    const groups = await Group.find(req.query).sort({ name: 1 });
    res.status(200).json(groups);
  } catch (err) {
    next(err);
  }
};

// Read a Group
export const getGroup = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) return next(createError(404, 'Group not found!'));

    res.status(200).json(group);
  } catch (err) {
    next(err);
  }
};

// Update Group
export const updateGroup = async (req, res, next) => {
  try {
    const group = await Group.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    if (!group) return next(createError(404, 'Group not found!'));

    res.status(200).json('Group has been updated.');
  } catch (err) {
    next(err);
  }
};

// Delete Group
export const deleteGroup = async (req, res, next) => {
  try {
    const deletedGroup = await Group.findById(req.params.id);

    if (!deletedGroup) return next(createError(404, 'Group Not Found'));

    const { channels } = deletedGroup;
    for (let i = 0; i < channels.length; i++) {
      const deletedChannel = await Channel.findById(channels[i]);

      if (!deletedChannel) next(createError(404, 'Channel Not Found'));
      if (deletedChannel.groups[1]) {
        Channel.findByIdAndUpdate(channels[i], {
          $pull: { groups: req.params.id },
        });
      } else {
        await Channel.findByIdAndDelete(channels[i]);
      }
    }
    await Group.findByIdAndDelete(req.params.id);
    res.status(200).json('Group has been deleted.');
  } catch (err) {
    next(err);
  }
};
