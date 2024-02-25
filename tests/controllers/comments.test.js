const request = require("supertest");
const JWT = require("jsonwebtoken");

const app = require("../../app");
const Post = require("../../models/post");
const User = require("../../models/user");
const Comment = require("../../models/comment");

require("../mongodb_helper");

const secret = process.env.JWT_SECRET;

const createToken = (userId) => {
    return JWT.sign(
    {
        user_id: userId,
        // Backdate this token of 5 minutes
        iat: Math.floor(Date.now() / 1000) - 5 * 60,
        // Set the JWT token to expire in 10 minutes
        exp: Math.floor(Date.now() / 1000) + 10 * 60,
    },
    secret
    );
    };


let token;
    describe("/comments", () => {
    beforeAll(async () => {
        const user = new User({
        full_name: "Test User",
        email: "comment-test@test.com",
        password: "12345678",
        });
        await user.save();
        await Post.deleteMany({});
        await Comment.deleteMany({});
        token = createToken(user.id);
    });

    afterEach(async () => {
        await User.deleteMany({});
        await Post.deleteMany({});
        await Comment.deleteMany({});

    });
describe("POST, when a valid token is present", () => {
    test("responds with a 201", async () => {
        const response = await request(app)
            .post("/comments")
            .set("Authorization", `Bearer ${token}`)
            .send({ commentText: "Hello World!" });
            expect(response.status).toEqual(201);
        });
        
        test("creates a new comment", async () => {
            await request(app)
            .post("/comments")
            .set("Authorization", `Bearer ${token}`)
            .send({ commentText: "Hello World!!" });
            
            const comments = await Comment.find();
        // console.log(comments)
        expect(comments.length).toEqual(1);
        expect(comments[0].message).toEqual("Hello World!!");
    });

    test("returns a new token", async () => {
        const testApp = request(app);
        const response = await testApp
            .post("/posts")
            .set("Authorization", `Bearer ${token}`)
            .send({ commentText: "hello world" });

        const newToken = response.body.token;
        const newTokenDecoded = JWT.decode(newToken, process.env.JWT_SECRET);
        const oldTokenDecoded = JWT.decode(token, process.env.JWT_SECRET);

        // iat stands for issued at
        expect(newTokenDecoded.iat > oldTokenDecoded.iat).toEqual(true);
        });
    });

    describe("POST, when token is missing", () => {
        test("responds with a 401", async () => {
            const response = await request(app)
                .post("/comments")
                .send({ commentText: "hello again world" });

            expect(response.status).toEqual(401);
        });

        test("a comment is not created", async () => {
            const response = await request(app)
                .post("/comments")
                .send({ commentText: "hello again world" });
    
            const posts = await Comment.find();
            expect(posts.length).toEqual(0);
        });

        test("a token is not returned", async () => {
            const response = await request(app)
                .post("/comments")
                .send({ commentText: "hello again world" });
    
            expect(response.body.token).toEqual(undefined);
            });
    });

    describe("GET, when token is present", () => {
        test("the response code is 200", async () => {
        const post1 = new Post({ message: "I love all my children equally" });
        const comment2 = new Comment({ commentText: "I've never cared for GOB" });
        await post1.save();
        await comment2.save();

        const response = await request(app)
            .get(`/posts/${post1._id}`)
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toEqual(200);
        });

        test("returns every comment in the collection", async () => {
            const post1 = new Post({ message: "howdy!" });
            const comment1 = new Comment({ commentText: "hola!" });
            await post1.save();
            await comment1.save();
    
            const response = await request(app)
                .get("/posts/all/1")
                .set("Authorization", `Bearer ${token}`);
            console.log(token)

            const posts = response.body.posts;
            const firstPost = posts[0];
            const comments = response.body.comments
            console.log("comments: " + comments)
            const firstComment = comments;
    
            expect(firstPost.message).toEqual("howdy!");
            expect(firstComment.commentText).toEqual("hola!");
        });

        test("returns a new token", async () => {
            const post1 = new Post({ message: "First Post!" });
            const comment1 = new Comment({ commentText: "Second Post!" });
            await post1.save();
            await comment1.save();
    
            const response = await request(app)
                .get(`/posts/${post1._id}`)
                .set("Authorization", `Bearer ${token}`);
    
            console.log("token: " + token)
    
            const newToken = response.body.token;
            console.log("token: " + newToken)
            const newTokenDecoded = JWT.decode(newToken, process.env.JWT_SECRET);
            const oldTokenDecoded = JWT.decode(token, process.env.JWT_SECRET);
    
            // iat stands for issued at
            expect(newTokenDecoded.iat > oldTokenDecoded.iat).toEqual(true);
        });
    });

    describe("GET, when token is missing", () => {
        test("the response code is 401", async () => {
            const post1 = new Post({ message: "howdy!" });
            const comment1 = new Comment({ commentText: "hola!" });
            await post1.save();
            await comment1.save();
        
            const response = await request(app).get("/posts");
        
            expect(response.status).toEqual(401);
        });

        test("returns no comments", async () => {
            const post1 = new Post({ message: "howdy!" });
            const comment1 = new Comment({ commentText: "hola!" });
            await post1.save();
            await comment1.save();
        
            const response = await request(app).get("/posts");
    
            expect(response.body.posts).toEqual(undefined);
        });


        test("does not return a new token", async () => {
            const post1 = new Post({ message: "howdy!" });
            const comment1 = new Comment({ commentText: "hola!" });
            await post1.save();
            await comment1.save();
    
            const response = await request(app).get("/posts");
    
            expect(response.body.token).toEqual(undefined);
        });
    });
});