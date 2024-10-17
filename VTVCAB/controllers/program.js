import Program from '../models/Program.js';
import Channel from '../models/Channel.js';
import { createError } from '../utils/error.js';

// create program
export const createProgram = async (req, res, next) => {
  const id = req.params.channelId;

  const channel = await Channel.findById(req.params.channelId);

  if (!channel) return next(createError(404, 'Channel not Found'));

  req.body.timeStart = Date.parse(new Date(req.body.timeStart));
  req.body.timeFinish = Date.parse(new Date(req.body.timeFinish));

  const checkStart = await Program.findOne({
    timeStart: { $gt: req.body.timeStart, $lt: req.body.timeFinish },
    channelId: id,
  });

  if (checkStart) return next(createError(404, 'This time was busy!'));

  const checkFinish = await Program.findOne({
    timeFinish: { $gt: req.body.timeStart, $lt: req.body.timeFinish },
    channelId: id,
  });

  if (checkFinish) return next(createError(404, 'This time was busy!'));

  const checkTime = await Program.findOne({
    timeStart: { $lte: req.body.timeStart },
    timeFinish: { $gte: req.body.timeFinish },
    channelId: id,
  });

  if (checkTime) return next(createError(404, 'This time was busy!'));

  const newProgram = new Program({ ...req.body, channelId: id });
  try {
    const savedProgram = await newProgram.save();
    try {
      await Channel.findByIdAndUpdate(id, {
        $push: { programs: savedProgram._id },
      });
    } catch (err) {
      next(err);
    }
    res.status(200).json('Program has been created.');
  } catch (err) {
    next(err);
  }
};

// Update program
export const updateProgram = async (req, res, next) => {
  try {
    const program = await Program.findById(req.params.id);

    if (!program) return next(createError(404, 'Program not Found'));

    if (req.body.timeStart)
      req.body.timeStart = Date.parse(new Date(req.body.timeStart));
    else req.body.timeStart = program.timeStart;
    if (req.body.timeFinish)
      req.body.timeFinish = Date.parse(new Date(req.body.timeFinish));
    else req.body.timeFinish = program.timeFinish;

    const checkStart = await Program.find({
      timeStart: { $gt: req.body.timeStart, $lt: req.body.timeFinish },
      channelId: program.channelId,
    });

    if (checkStart.length > 1)
      return next(createError(404, 'This time was busy!'));
    if (checkStart.length === 1 && checkStart[0].id !== req.params.id)
      return next(createError(404, 'This time was busy!'));

    const checkFinish = await Program.find({
      timeFinish: { $gt: req.body.timeStart, $lt: req.body.timeFinish },
      channelId: program.channelId,
    });

    if (checkFinish.length > 1)
      return next(createError(404, 'This time was busy!'));
    if (checkFinish.length === 1 && checkFinish[0].id !== req.params.id)
      return next(createError(404, 'This time was busy!'));

    const checkTime = await Program.find({
      timeStart: { $lt: req.body.timeStart },
      timeFinish: { $gt: req.body.timeFinish },
      channelId: program.channelId,
    });

    if (checkTime.length > 1)
      return next(createError(404, 'This time was busy!'));
    if (checkTime.length === 1 && checkTime[0].id !== req.params.id)
      return next(createError(404, 'This time was busy!'));

    await Program.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json('Program has been updated.');
  } catch (err) {
    next(err);
  }
};

// Delete program
export const deleteProgram = async (req, res, next) => {
  try {
    const deletedProgram = await Program.findById(req.params.id);

    if (!deletedProgram) return next(createError(404, 'Not Found'));

    await Program.findByIdAndDelete(req.params.id);
    try {
      await Channel.findByIdAndUpdate(deletedProgram.channelId, {
        $pull: { programs: req.params.id },
      });
    } catch (err) {
      next(err);
    }
    res.status(200).json('Program has been deleted.');
  } catch (err) {
    next(err);
  }
};

// delete video in chanel in a day
export const deleteDayVideoProgram = async (req, res, next) => {
  const min = Date.parse(new Date(req.query.day));
  const max = min + Number(process.env.DAYTIME);
  try {
    const deletedProgram = await Program.find({
      timeStart: { $gt: min, $lt: max },
      timeFinish: { $gt: min, $lt: max },
      channelId: req.params.channelId,
    });

    if (deletedProgram[0]) {
      await Program.updateMany(
        {
          timeStart: { $gt: min, $lt: max },
          timeFinish: { $gt: min, $lt: max },
          channelId: req.params.channelId,
        },
        { $set: { source: null } }
      );
      res.status(200).json(deletedProgram);
    } else {
      return next(createError(404, 'Not Found'));
    }
  } catch (err) {
    next(err);
  }
};

// Get current program in a channel
export const getCurrentProgram = async (req, res, next) => {
  const time = new Date(Number(process.env.CURRENT_TIME)).getTime();
  try {
    const program = await Program.findOne({
      timeStart: { $lt: time },
      timeFinish: { $gt: time },
      channelId: req.params.channelId,
    });

    if (!program) return next(createError(404, 'Program Not Found'));

    program.timeStart = new Date(Number(program.timeStart));
    program.timeFinish = new Date(Number(program.timeFinish));

    const channel = await Channel.findById(req.params.channelId);

    if (!channel) return next(createError(404, 'Channel Not Found'));

    program.source = channel.source;
    res.status(200).json(program);
  } catch (err) {
    next(err);
  }
};

// Get a program in a channel
export const getProgram = async (req, res, next) => {
  try {
    const program = await Program.findById(req.params.id);

    if (!program) return next(createError(404, 'Not Found'));

    const time = new Date(process.env.CURRENT_TIME).getTime();

    if (program.timeStart < time && program.timeFinish > time) {
      return getCurrentProgram(req, res, next);
    }

    program.timeStart = new Date(Number(program.timeStart));
    program.timeFinish = new Date(Number(program.timeFinish));

    res.status(200).json(program);
  } catch (err) {
    next(err);
  }
};

// get all programs in a channel in  a day
export const getDailyPrograms = async (req, res, next) => {
  try {
    const id = req.params.channelId;
    const channel = await Channel.findById(id);

    if (!channel) return next(createError(404, 'Channel Not Found'));

    const min = Date.parse(new Date(req.query.day));
    const max = min + Number(process.env.DAYTIME);
    const programs = await Program.find({
      timeStart: { $gt: min, $lt: max },
      timeFinish: { $gt: min, $lt: max },
      channelId: req.params.channelId,
    });

    if (programs[0]) {
      for (let i = 0; i < programs.length; i++) {
        programs[i].timeStart = new Date(Number(programs[i].timeStart));
        programs[i].timeFinish = new Date(Number(programs[i].timeFinish));
      }
      res.status(200).json(programs);
    } else return next(createError(404, 'Program Not Found'));
  } catch (err) {
    next(err);
  }
};
