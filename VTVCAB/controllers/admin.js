import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import { createError } from '../utils/error.js';

// Login
export const loginAdmin = async (req, res, next) => {
  try {
    const admin = await Admin.findOne({ account: req.body.account });

    if (!admin) return next(createError(404, 'Admin not found!'));

    const isPasswordCorrect = await bcrypt.compare(
      req.body.password,
      admin.password
    );

    if (!isPasswordCorrect)
      return next(createError(400, 'Wrong password or username!'));

    const token = jwt.sign({ id: admin.id }, process.env.JWT);

    res
      .cookie('adminAccessToken', token, {
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
export const logoutAdmin = async (req, res, next) => {
  try {
    res
      .clearCookie('adminAccessToken')
      .status(200)
      .json('Logout successfully!');
  } catch (err) {
    next(err);
  }
};

// Create admin account
export const createAdmin = async (req, res, next) => {
  try {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);

    const newAdmin = new Admin({
      ...req.body,
      password: hash,
    });

    await newAdmin.save();
    res.status(200).json('Admin has been created.');
  } catch (err) {
    next(err);
  }
};

// Read all admin account
export const getAllAdmin = async (req, res, next) => {
  try {
    const admins = await Admin.find();
    res.status(200).json(admins);
  } catch (err) {
    next(err);
  }
};

// Change admin password
export const updateAdmin = async (req, res, next) => {
  if (!req.body.password)
    return next(createError(400, 'New password required!'));

  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(req.body.password, salt);

  try {
    const admin = await Admin.findByIdAndUpdate(req.params.id, {
      password: hash,
    });

    if (!admin) return next(createError(404, 'Admin not found!'));

    res.status(200).json('Password has been changed.');
  } catch (err) {
    next(err);
  }
};
