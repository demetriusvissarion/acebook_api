// models/comment.test.js
require("../mongodb_helper");

const Comment = require("../../models/comment");

describe("Comment model", () => {
  beforeEach(async () => {
    await Comment.deleteMany({});
  });

  it("has a message", () => {
    const comment = new Comment({ message: "some message" });
    expect(comment.message).toEqual("some message");
  });

  it("can list all comments", async () => {
    const comments = await Comment.find();
    expect(comments).toEqual([]);
  });

  it("can save a comment", async () => {
    const comment = new Comment({ message: "some message" });

    await comment.save();
    const comments = await Comment.find();
    expect(comments[0].message).toEqual("some message");
  });

  // Add more test cases as needed for specific functionality
});
