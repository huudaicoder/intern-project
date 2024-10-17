import Channel from '../models/Channel.js';
import Program from '../models/Program.js';
import Group from '../models/Group.js';
import { createError } from '../utils/error.js';

// Create channel
export const createChannel = async (req, res, next) => {
  const newChannel = new Channel(req.body);
  try {
    const savedChannel = await newChannel.save();
    const { groups } = savedChannel;
    for (let i = 0; i < groups.length; i++) {
      await Group.findByIdAndUpdate(groups[i], {
        $push: { channels: savedChannel._id },
      });
    }
    res.status(200).json('Channel has been created.');
  } catch (err) {
    next(err);
  }
};

// Update channel
export const updateChannel = async (req, res, next) => {
  try {
    const channel = await Channel.findById(req.params.id);

    if (!channel) return next(createError(404, 'Channel Not Found'));

    const { groups } = channel;
    const updatedChannel = await Channel.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    for (let i = 0; i < groups.length; i++) {
      await Group.findByIdAndUpdate(groups[i], {
        $pull: { channels: req.params.id },
      });
    }
    const group = updatedChannel.groups;
    for (let m = 0; m < group.length; m++) {
      await Group.findByIdAndUpdate(group[m], {
        $push: { channels: req.params.id },
      });
    }
    res.status(200).json('Channel has been updated.');
  } catch (err) {
    next(err);
  }
};

// Delete channel
export const deleteChannel = async (req, res, next) => {
  try {
    const deletedChannel = await Channel.findById(req.params.id);

    if (!deletedChannel) return next(createError(404, 'Channel Not Found'));

    const { programs } = deletedChannel;

    if (programs.length) {
      for (let i = 0; i < programs.length; i++) {
        const deletedProgram = await Program.findById(programs[i]);

        if (!deletedProgram) return next(createError(404, 'Program Not Found'));

        await Program.findByIdAndDelete(programs[i]);
      }
    }

    const { groups } = deletedChannel;

    if (groups.length) {
      for (let m = 0; m < groups.length; m++) {
        await Group.findByIdAndUpdate(groups[m], {
          $pull: { channels: req.params.id },
        });
      }
    }

    await Channel.findByIdAndDelete(req.params.id);
    res.status(200).json('Channel has been deleted.');
  } catch (err) {
    next(err);
  }
};

// Get a channel
export const getChannel = async (req, res, next) => {
  try {
    const channel = await Channel.findById(req.params.id);

    if (!channel) return next(createError(404, 'Not Found'));

    res.status(200).json(channel);
  } catch (err) {
    next(err);
  }
};

// Get all channels
export const getChannels = async (req, res, next) => {
  try {
    const channels = await Channel.find(req.query).sort({ name: 1 });
    res.status(200).json(channels);
  } catch (err) {
    next(err);
  }
};

// Get all channels in a group
export const getGroupChannels = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.groupId);

    if (!group) return next(createError(404, 'Not Found'));

    const mang = group.channels;
    const channel = [];
    for (let i = 0; i < mang.length; i++) {
      channel[i] = await Channel.findById(mang[i]);
    }
    res.status(200).json(channel);
  } catch (err) {
    next(err);
  }
};

// Check access right
export const checkAccessRight = async (req, res, next) => {
  try {
    if (!req.params.channelId) {
      const program = await Program.findById(req.params.id);

      if (!program) return next(createError(404, 'Program Not Found'));

      const channel = await Channel.findById(program.channelId);

      if (!channel) return next(createError(404, 'Channel Not Found'));

      req.check = channel.accessRight;
      req.program = program;
      next();
    } else {
      const channel = await Channel.findById(req.params.channelId);

      if (!channel) return next(createError(404, 'Channel Not Found'));

      req.check = channel.accessRight;
      next();
    }
  } catch (err) {
    next(err);
  }
};
