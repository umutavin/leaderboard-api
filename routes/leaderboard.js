const express = require("express");
const router = express.Router();
const client = require("../db/redis").getConnection();

router.get("/", (req, res, next) => {
  client.zrevrange(
    "leaderboard_set",
    0,
    -1,
    "withscores",
    function (err, leaderboard) {
      if (err) {
        next(err);
        return err;
      } else {
        let leaderboardArr = new Array(leaderboard.length / 2);
        let rankCounter = 0;
        let fetchedUserCount = 0;

        for (let i = 0; i < leaderboard.length; i += 2) {
          client.hmget(
            leaderboard[i],
            ["display_name", "country"],
            function (err, userInfo) {
              const player = {
                rank: ++rankCounter,
                points: leaderboard[i + 1],
                display_name: userInfo[0],
                country: userInfo[1],
              };
              leaderboardArr[i / 2] = player;
              fetchedUserCount++;

              if (fetchedUserCount == leaderboard.length / 2) {
                res.send(leaderboardArr);
              }
            }
          );
        }
      }
    }
  );
});


//Returns leaderboard by country iso code
router.get("/:country_iso_code", (req, res) => {
  client.zrevrange(
    "leaderboard_set",
    0,
    -1,
    "withscores",
    function (err, leaderboard) {
      if (err) {
        next(err);
        return err;
      } else {
        var leaderboardArr = new Array();
        var fetchedUserCount = 0; // Counts the fetched user count
        var j = 0;
        var isSent = false;

        for (let i = 0; i < leaderboard.length; i += 2) {
          client.hmget(
            leaderboard[i],
            ["display_name", "country"],
            function (err, playerData) {
              fetchedUserCount++;

              if (playerData[1].toLowerCase() === req.params.country_iso_code.toLowerCase()) {
                const player = {
                  rank: i / 2 + 1,
                  points: leaderboard[i + 1],
                  display_name: playerData[0],
                  country: playerData[1],
                };
                leaderboardArr[j] = player;
                j++;

                if (fetchedUserCount == leaderboard.length / 2) {
                  isSent = true;
                  if (leaderboardArr.length == 0) {
                    res.json({
                      msg:
                        "There is no player from " +
                        req.params.country_iso_code,
                    });
                  } else {
                    res.send(leaderboardArr);
                  }
                }
              }

              if (fetchedUserCount == leaderboard.length / 2 && !isSent) {
                isSent = true;
                if (leaderboardArr.length == 0) {
                  res.json({
                    msg:
                      "There is no player from " + req.params.country_iso_code,
                  });
                } else {
                  res.send(leaderboardArr);
                }
              }
            }
          );
        }
      }
    }
  );
});


module.exports = router;