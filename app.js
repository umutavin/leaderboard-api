const express = require("express");
const app = express();
const leaderboard = require("./routes/leaderboard");
const user = require("./routes/user");
const score = require("./routes/score");

app.use(express.json());
app.get("/", (req, res, next) => {
  res.send("Welcome to leaderboard!");
});
app.use("/leaderboard", leaderboard);
app.use("/user", user.router);
app.use("/score", score);

module.exports = app;
