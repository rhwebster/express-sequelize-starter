const express = require("express");

const db = require("../db/models");
const { Tweet } = db;
const { check, validationResult } = require("express-validator");
const router = express.Router();

const asyncHandler = (handler) => (req, res, next) =>
  handler(req, res, next).catch(next);

const tweetNotFoundError = (tweetId) => {
  const error = new Error(`A tweet with the given id ${tweetId} not found.`);
  error.title = "Tweet not found";
  error.status = 404;
  return error;
};

const tweetValidators = [
  check("message")
    .exists({ checkFalsy: true })
    .withMessage("Please type at least 1 character")
    .isLength({ max: 280 })
    .withMessage("Tweet cannot exceed 280 characters"),
];

const handleValidationErrors = (req, res, next) => {
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    const errors = validationErrors.array().map((error) => error.msg);
    const error = new Error("Bad request.");
    error.errors = errors;
    error.status = 400;
    error.title = "Bad request.";
    next(error);
  }
  next();
};

router.get("/", (req, res) => {
  res.json({ message: "test tweets index" });
});

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const tweets = await Tweet.findAll();
    res.json({ tweets });
  })
);

router.get(
  "/:id(\\d+)",
  asyncHandler(async (req, res, next) => {
    const tweetId = req.params.id;
    const tweet = await Tweet.findByPk(tweetId);
    if (tweet) {
      res.json(tweet);
    } else {
      next(tweetNotFoundError(tweetId));
    }
  })
);

router.post(
  "/",
  tweetValidators,
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const newTweet = await Tweet.create({
      message: req.body.message,
    });
    res.json(newTweet);
  })
);

router.put(
    "/:id(\\d+)", 
    tweetValidators,
    handleValidationErrors,
    asyncHandler(async (req, res) => {
        const tweetId = req.params.id;
        const tweet = await Tweet.findByPk(tweetId);
        if (tweet) {
            await tweet.update({message: req.body.message})
            res.json(tweet);
        } else {
            next(tweetNotFoundError(tweetId));
        }
    })
)

router.delete(
    "/:id(\\d+)",
    asyncHandler(async (req, res) => {
        const tweetId = req.params.id;
        const tweet = await Tweet.findByPk(tweetId);
        if (tweet) {
            await tweet.destroy()
            res.status(204).end();
        } else {
            next(tweetNotFoundError(tweetId));
        }
    })
);

module.exports = router;
