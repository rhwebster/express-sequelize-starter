const { check } = require("express-validator");
const { asyncHandler, handleValidationErrors } = require("../utils");
const db = require("../db/models");
const { User } = db
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { getUserToken } = require("../auth.js");
const { get } = require("../app");

const validateUsername = check("username")
  .exists({ checkFalsy: true })
  .withMessage("Please provide a username");

const validateEmailAndPassword = [
  check("email")
    .exists({ checkFalsy: true })
    .isEmail()
    .withMessage("Please provide a valid email."),
  check("password")
    .exists({ checkFalsy: true })
    .withMessage("Please provide a password."),
];

router.post(
  "/",
  validateUsername,
  validateEmailAndPassword,
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, hashedPassword });

    const token = getUserToken(user);
    res.status(201).json({
      user: { id: user.id },
      token,
    });
  })
);

router.post(
    '/token',
    validateEmailAndPassword,
    asyncHandler(async (req, res, next) => {
        const { email, password } = req.body;
        const user = await User.findOne({
            where: {
                email,
            },
        });
        console.log("this is what you're looking for 1")
        if(!user || !user.validatePassword(password)) {
            console.log("this is what you're looking for 2")
            const err = new Error("Login Failed");
            err.status = 401;
            err.title = "Login Failed";
            err.errors = ["The provided credentials were invalid."];
            return next(err);
        }
        console.log("this is what you're looking for 3")
        const token = getUserToken(user);
        res.json({ token, user: { id: user.id } });
    })
)

module.exports = router;
