const express = require("express");
const router = express.Router();
const client = require("../db/redis").getConnection();
const { v4: uuidv4 } = require('uuid');
const generateRandomName = require('random-name');
const generateRandomCountry = require('random-country');
const { body, validationResult } = require('express-validator');

// Gets specified user information if given user_id exists.
router.get("/profile/:guid", (req, res, next) => {
  client.exists(req.params.guid, function (err, exists) {
    if (err) {
      next(err);
    } else {
      if (exists) {
        client.zrevrank("leaderboard_set", req.params.guid, function (err, rank) {
          if (err) {
            next(err);
          } else {
            client.hmget(
              req.params.guid,
              ["display_name", "points", "country"],
              function (err, response) {
                if (err) {
                  next(err);
                } else {
                  res.setHeader("Content-Type", "application/json");
                  res.json({
                    user_id: req.params.guid,
                    display_name: response[0],
                    points: response[1],
                    rank: rank + 1,
                    country: response[2],
                  });
                }
              }
            );
          }
        });
      } else {
        res.status(400);
        res.send('This user does not exist');
      }
    }
  });
});

// Creates user hash on redis and inserts score into leaderboard sorted set.
router.post("/create", [
  body("user_id", "User ID is required").notEmpty(),
  body("display_name", "Name is required").notEmpty(),
  body("points", "Points cannot be null").notEmpty()
], (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  client.exists(req.body.user_id, function (err, exists) {
    if (err) {
      next(err);
    } else {
      if (exists) {
        res.status(400);
        res.send("This user already exists.");
      } else {
        client.hset(
          req.body.user_id,
          [
            "display_name",
            req.body.display_name,
            "points",
            req.body.points,
            "country",
            req.body.country.toLowerCase(),
          ],
          function (err, response) {
            if (err) {
              next(err);
            } else {
              client.zadd(
                ["leaderboard_set", req.body.points, req.body.user_id],
                function (err, response) {
                  if (err) {
                    next(err);
                  } else {
                    client.zrevrank(
                      "leaderboard_set",
                      req.body.user_id,
                      function (err, rank) {
                        res.setHeader("Content-Type", "application/json");
                        res.json({
                          user_id: req.body.user_id,
                          display_name: req.body.display_name,
                          points: req.body.points,
                          rank: rank + 1,
                          country: req.body.country.toLowerCase(),
                        });
                      }
                    );
                  }
                }
              );
            }
          }
        );
      }
    }
  });
});

router.post("/generate/:number", (req, res, next) => {
  users = generateUsers(req.params.number);
  for (let i = 0; i < req.params.number; i++) {
    let user_id = uuidv4();
    client.hset(
      user_id,
      [
        "display_name",
        users[i].display_name,
        "points",
        users[i].points.toString(),
        "country",
        users[i].country,
      ],
      function (err, response) {
        if (err) {
          next(err);
        } else {
          client.zadd(
            ["leaderboard_set", users[i].points, user_id],
            function (err, response) {
              if (err) {
                next(err);
              }
            }
          );
        }
      });
  }
  res.setHeader("Content-Type", "application/json");
  res.json({
    createdUserNumber: req.params.number
  });
});

function generateUsers(number) {
  let users = [];
  for (let i = 0; i < number; i++) {
    let user = {
      display_name: generateRandomName(),
      points: Math.floor(Math.random() * 1000000), //1.000.000 points is chosen as Max.
      country: generateRandomCountry(),
    }
    users.push(user);
  }
  return users;
}

module.exports = { router, generateUsers };