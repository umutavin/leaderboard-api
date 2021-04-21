const express = require("express");
const router = express.Router();
const client = require("../db/redis").getConnection();
const { body, validationResult } = require('express-validator');

/**
 * @description
 * Checks if timestamp is correct and player exists.
 * If submitted score is greater than previous one, player gets a new high score
 * Else player's score remains same.
 */
router.post("/submit", [
  body("score_worth", "Score worth is required").notEmpty(),
  body("user_id", "User ID is required").notEmpty(),
  body("timestamp", "Timestamp cannot be null").notEmpty()
], (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  if (isFutureDate(req.body.timestamp)) {
    res.status(400);
    res.send("You cannot submit score for invalid time.");
  } else {
    const submittedScore = req.body.score_worth;
    client.zscore(
      "leaderboard_set",
      req.body.user_id,
      function (err, highestScore) {
        if (err) {
          res.send("Player could not find!");
          next(err);
        } else {
          let previousScore = parseInt(highestScore, 10);
          if (submittedScore > previousScore) {
            client.hset(
              req.body.user_id,
              [
                "points",
                submittedScore
              ],
              function (err,) {
                if (err) {
                  next(err);
                } else {
                  client.zadd(
                    ["leaderboard_set", 'XX', submittedScore, req.body.user_id],
                    function (err, response) {
                      if (err) {
                        next(err);
                      } else {
                        // Fetch updated rank
                        client.zrevrank(
                          "leaderboard_set",
                          req.body.user_id,
                          function (err, rank) {
                            if (err) {
                              next(err);
                            } else {
                              res.status(200);
                              res.json({
                                score_worth: submittedScore,
                                user_id: req.body.user_id,
                                timestamp: req.body.timestamp
                              });
                            }
                          }
                        );
                      }
                    }
                  );
                }
              });
          } else {
            client.zrevrank(
              "leaderboard_set",
              req.body.user_id,
              function (err, rank) {
                if (err) {
                  next(err);
                } else {
                  res.status(200);
                  res.json({
                    score_worth: req.body.score_worth,
                    user_id: req.body.user_id,
                    timestamp: req.body.timestamp
                  }
                  );
                }
              }
            );
          }
        }
      }
    );
  }
});

// Checks if submission date is valid. Submission date cannot be in the future.
function isFutureDate(submitTime) {
  return new Date().getTime() <= new Date(submitTime).getTime();
}

module.exports = router;