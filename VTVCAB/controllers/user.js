import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { createError } from '../utils/error.js';

// Create user account
export const createUser = async (req, res, next) => {
  try {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);

    const newUser = new User({
      ...req.body,
      password: hash,
    });

    await newUser.save();
    res.status(200).json('User has been created.');
  } catch (err) {
    next(err);
  }
};

// Login
export const loginUser = async (req, res, next) => {
  try {
    const user = await User.findOne({ phone: req.body.phone });

    if (!user) return next(createError(404, 'User not found!'));

    const isPasswordCorrect = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if (!isPasswordCorrect)
      return next(createError(400, 'Wrong password or username!'));

    const token = jwt.sign({ id: user.id }, process.env.JWT);

    res
      .cookie('userAccessToken', token, {
        httpOnly: true,
        expires: new Date(Date.now() + Number(process.env.EXPIRATION_TIME)),
      })
      .status(200)
      .json('Login successfully!');
  } catch (err) {
    next(err);
  }
};

// Logout
export const logoutUser = async (req, res, next) => {
  try {
    res.clearCookie('userAccessToken').status(200).json('Logout successfully!');
  } catch (err) {
    next(err);
  }
};

// Read all user account info
export const getAllUser = async (req, res, next) => {
  try {
    const users = await User.find(req.query);
    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
};

// Read an user account info
export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) return next(createError(404, 'User not found!'));

    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

// Update user password
export const updateUser = async (req, res, next) => {
  if (!req.body.password) {
    try {
      const user = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });

      if (!user) return next(createError(404, 'User not found!'));

      res.status(200).json('Information has been updated.');
    } catch (err) {
      next(err);
    }
  } else {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);

    try {
      await User.findByIdAndUpdate(
        req.params.id,
        {
          password: hash,
        },
        { new: true }
      );
      res.status(200).json('Password has been changed.');
    } catch (err) {
      next(err);
    }
  }
};
