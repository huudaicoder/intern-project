import jwt from 'jsonwebtoken';
import { createError } from './error.js';

// kiểm tra đăng nhập của admin
export const verifyAdminToken = (req, res, next) => {
  const token = req.cookies.adminAccessToken;

  if (!token) {
    return next(createError(401, 'You are not authenticated!'));
  }

  jwt.verify(token, process.env.JWT, (err, info) => {
    if (err) {
      return next(createError(403, 'Token is not valid!'));
    }

    req.info = info;
    next();
  });
};

// kiểm tra đăng nhập của user
export const verifyUserToken = (req, res, next) => {
  if (req.check === false || req.cookies.adminAccessToken) {
    if (req.cookies.adminAccessToken) return verifyAdminToken(req, res, next);

    return next();
  }

  const token = req.cookies.userAccessToken;

  if (!token) {
    return next(createError(401, 'You are not authenticated!'));
  }

  jwt.verify(token, process.env.JWT, (err, info) => {
    if (err) {
      return next(createError(403, 'Token is not valid!'));
    }

    req.info = info;
    next();
  });
};

// kiểm tra đăng nhập của admin (id của admin cần trùng với param id)
export const verifyAdmin = (req, res, next) => {
  verifyAdminToken(req, res, (err) => {
    if (err) return next(err);

    if (req.info.id === req.params.id) {
      next();
    } else {
      return next(createError(403, 'You are not authorized!'));
    }
  });
};

// kiểm tra đăng nhập của user (id của user trùng với param id) hoặc của admin
export const verifyAdminOrUser = (req, res, next) => {
  if (req.cookies.userAccessToken) {
    verifyUserToken(req, res, (err) => {
      if (err) return next(err);
      if (req.info.id === req.params.id) {
        next();
      } else {
        return next(createError(403, 'You are not authorized!'));
      }
    });
  } else if (req.cookies.adminAccessToken) {
    verifyAdminToken(req, res, next);
  } else return next(createError(401, 'You are not authenticated!'));
};
