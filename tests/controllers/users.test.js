const request = require("supertest");
const app = require("../../app");
const User = require("../../models/user");
jest.mock("../../lib/token");


require("../mongodb_helper");

describe("/users", () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe("GET /users/:id", () => {
    test("should get a user and a token with valid user ID", async () => {
      const newUser = await User.create({
        full_name: "Test User",
        email: "test@example.com",
        password: "testPassword",
      });
  
      const response = await request(app)
        .get(`/users/${newUser._id}`)
        .expect(200);
      // console.log(response.body)
      // console.log(newUser)
      expect(response.body.user._id.toString()).toBe(newUser._id.toString());
    });
  });


  describe("POST, create a new user when all the information is provided", () => {
    test("a user is created", async () => {
      const userData = {
        full_name: "Test User",
        email: "test@example.com",
        password: "testPassword",
      };

      const response = await request(app)
        .post("/users")
        .send(userData);

      expect(response.statusCode).toBe(201);
      expect(response.body.userId).toBeDefined();

      // Optionally, you can check that the user was saved to the database
      const user = await User.findOne({ email: userData.email });
      expect(user).not.toBeNull();
      });
    });

  describe("POST, when password is missing", () => {
    test("response code is 400", async () => {
      const response = await request(app)
        .post("/users")
        .send({ email: "skye@email.com" });

      expect(response.statusCode).toBe(400);
    });

    test("does not create a user", async () => {
      await request(app).post("/users").send({ email: "skye@email.com" });

      const users = await User.find();
      expect(users.length).toEqual(0);
    });
  });

  describe("POST, when email is missing", () => {
    test("response code is 400", async () => {
      const response = await request(app)
        .post("/users")
        .send({ password: "1234" });

      expect(response.statusCode).toBe(400);
    });

    test("does not create a user", async () => {
      await request(app).post("/users").send({ password: "1234" });

      const users = await User.find();
      expect(users.length).toEqual(0);
    });
  });
});
