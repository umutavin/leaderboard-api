# Leaderboard-API
Fast and scalable Leaderboard API. Tech stack: Node, Express, AWS Elasticache Redis

## Available Scripts

In the project directory, you can run:

### `npm run start`

Runs the api.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `npm run test`

Launches the Jest test runner.<br />

# Endpoints
- /leaderboard -> Gets leaderboard sorted set
- /leaderboard/:country_iso_code -> Gets leaderboard sorted set by country
- /user/profile/:uuid -> Gets user by user_id
- /user/create -> Creates user
- /score/submit -> Submits new score by a user
- /user/generate/:number -> Creates random user list and leaderboard according to given number of users
