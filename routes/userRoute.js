const { Router } = require("express");
const userRouter = Router();
const { body, validationResult } = require('express-validator');

const { login, logout, createUser, refresh } = require("../controllers/userController");

userRouter.route("/login").post(
    login,
    // email
    body('email').isEmail(),
    // aircraft id must be a string
    body('password').isString(),
    (req, res, next) => {
        // Finds the validation errors in this request and wraps them in an object with handy functions
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error : errors.array()});
        }
        next();
    }
);
userRouter.route("/logout").post(
    logout,
    // refresh token must be a string
    body('refreshToken').isString(),
    (req, res, next) => {
        // Finds the validation errors in this request and wraps them in an object with handy functions
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error : errors.array()});
        }
        next();
    }
);
userRouter.route("/refresh").post(
    refresh,
    // refresh token must be a string
    body('refreshToken').isString(),
    (req, res, next) => {
        // Finds the validation errors in this request and wraps them in an object with handy functions
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error : errors.array()});
        }
        next();
    }
);
userRouter.route("/").post(
    createUser,
    // name must be a string
    body('name').isString(),
    // email
    body('email').isEmail(),
    // password must be a string
    body('password').isString(),
    (req, res, next) => {
        // Finds the validation errors in this request and wraps them in an object with handy functions
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error : errors.array()});
        }
        next();
    }
);




module.exports = {
    userRouter
};