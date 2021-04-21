const app = require("../app");
const request = require("supertest");
const Constants = require("../constants")
const { v4: uuidv4 } = require('uuid');
const User = require("../routes/user");

describe('User Test Suite', () => {
  it('should create user', async () => {
    await request(app).post("/user/create")
      .send({
        user_id: uuidv4(),
        display_name: Constants.userToBeGotten.display_name,
        points: Constants.userToBeGotten.points,
        country: Constants.userToBeGotten.country
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        expect(res.body.points).toEqual("23");
        expect(res.body.country).toEqual("us");
        expect(res.body.display_name).toEqual("Michael Jordan");
      });
  });

  it('should not create user if user_id, display_name does not exist', async () => {
    await request(app).post("/user/create")
      .send({
        user_id: '',
        display_name: '',
        points: Constants.userToBeGotten.points,
        country: Constants.userToBeGotten.country
      })
      .expect('Content-Type', /json/)
      .expect(400)
      .then((res) => {
        expect(res.body.errors).toHaveLength(2);
        expect(res.body.errors[0].msg).toEqual("User ID is required");
        expect(res.body.errors[1].msg).toEqual("Name is required");
      });
  });

  it('should generate users', async () => {
    const userNumber = 5;
    await request(app).post("/user/generate/" + userNumber)
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        expect(res.body.createdUserNumber).toEqual(userNumber.toString());
      });
  });

  it('should get user', async () => {
    const testUserId = Constants.userToBeGotten.user_id;
    await request(app).get("/user/profile/" + testUserId)
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        expect(res.body.points).toEqual("23");
        expect(res.body.country).toEqual("us");
        expect(res.body.display_name).toEqual("Michael Jordan");
      });
  });

  it('should not get user if user_id is invalid', async () => {
    const testUserId = 'invalid_user_id';
    await request(app).get("/user/profile/" + testUserId)
      .expect(400);
  });

  it('should create user list', () => {
    const createdUserNumber = 5;
    const users = User.generateUsers(5);
    expect(users).toHaveLength(createdUserNumber);
    expect(users[0].display_name).toBeDefined();
    expect(users[0].points).toBeDefined();
    expect(users[0].points).toBeLessThan(1000000);
    expect(users[0].country).toBeDefined();
  });
});