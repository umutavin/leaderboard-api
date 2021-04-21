const app = require("../app");
const request = require("supertest");

describe('Leaderboard Test Suite', () => {
  it('should get leaderboard', async () => {
    await request(app).get("/leaderboard")
      .expect('Content-Type', /json/)
      .expect(200)
  });

  it('should get leaderboard by country', async () => {
    const country_iso_code = "us";
    await request(app).get("/leaderboard/" + country_iso_code)
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        expect(res.body[0].country).toEqual("us");
      });
  });
});