const app = require("../app");
const request = require("supertest");
const Constants = require("../constants")

describe('Score Test Suite', () => {
  it('should update score and rank if high score is achieved', async () => {
    await request(app).post("/score/submit")
      .send({
        score_worth: Constants.userToBeUpdated.points + 1, // To achieve new record
        user_id: Constants.userToBeUpdated.user_id,
        timestamp: 1400000,
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        expect(res.body.score_worth).toBeDefined();
        expect(res.body.user_id).toEqual(Constants.userToBeUpdated.user_id);
        expect(res.body.timestamp).toEqual(1400000);
      });
  });
  it('should not update score if request body has missing values', async () => {
    await request(app).post("/score/submit")
      .send({
        score_worth: '', // To achieve new record
        user_id: '',
        timestamp: '',
      })
      .expect('Content-Type', /json/)
      .expect(400)
      .then((res) => {
        expect(res.body.errors).toHaveLength(3);
        expect(res.body.errors[0].msg).toEqual("Score worth is required");
        expect(res.body.errors[1].msg).toEqual("User ID is required");
        expect(res.body.errors[2].msg).toEqual("Timestamp cannot be null");
      });
  });

  it('should not update score if timestamp is in future', async () => {
    await request(app).post("/score/submit")
      .send({
        score_worth: 1000, // To achieve new record
        user_id: Constants.userToBeUpdated,
        timestamp: 2000000000000,
      })
      .expect(400)
  });

});