const request = require("supertest");
const db = require("../db/connection");
const seed = require("../db/seeds/seed.js");
const app = require("../app.js");
const testData = require("../db/data/test-data/index");

afterAll(() => db.end());

beforeEach(() => seed(testData));

describe("GET /api/topics", () => {
  test("Status: 200, returns an array", async () => {
    const { body } = await request(app).get("/api/topics").expect(200);
    expect(Array.isArray(body.topics)).toBe(true);
  });
  test("Status: 200, returns an array of length 3", async () => {
    const { body } = await request(app).get("/api/topics").expect(200);
    expect(body.topics.length).toBe(3);
  });
  test("Status: 200, returned array contains topics", async () => {
    const { body } = await request(app).get("/api/topics").expect(200);
    const topics = body.topics;
    expect(topics.length).toBe(3);
    topics.forEach((topic) => {
      expect(topic).toHaveProperty("slug", expect.any(String));
      expect(topic).toHaveProperty("description", expect.any(String));
    });
  });
});

describe("GET /api/articles", () => {
  test("Status: 200, returns an array of all articles", async () => {
    const { body } = await request(app).get("/api/articles").expect(200);
    const { articles } = body;
    expect(articles.length).toBe(10);
    articles.forEach((article) => {
      expect(article).toEqual(
        expect.objectContaining({
          article_id: expect.any(Number),
          title: expect.any(String),
          topic: expect.any(String),
          author: expect.any(String),
          body: expect.any(String),
          created_at: expect.any(String),
          votes: expect.any(Number),
          comment_count: expect.any(String),
        })
      );
    });
  });
  test("Status: 200, articles are sorted by date in descending order", async () => {
    const { body } = await request(app).get("/api/articles").expect(200);
    expect(body.articles).toBeSortedBy("created_at", {
      descending: true,
    });
  });
});

describe("GET /api/articles with pagination", () => {
  test("Status: 200, returns 5 articles when the limit is set to 5", async () => {
    const { body } = await request(app)
      .get("/api/articles?limit=5")
      .expect(200);
    expect(body.articles.length).toBe(5);
  });
  test("Status: 200, returns 8 articles when the limit is set to 8", async () => {
    const { body } = await request(app)
      .get("/api/articles?limit=8")
      .expect(200);
    expect(body.articles.length).toBe(8);
  });
  test("Status: 200, returns 10 articles when the limit is not provided", async () => {
    const { body } = await request(app).get("/api/articles").expect(200);
    expect(body.articles.length).toBe(10);
  });
  test("Status: 200, starts at page 3 with limit set to 3", async () => {
    const { body } = await request(app)
      .get("/api/articles?limit=3&p=3")
      .expect(200);
    expect(body.articles[0].title).toBe(
      "Seven inspirational thought leaders from Manchester UK"
    );
  });
  test("Status: 200, starts at page 1", async () => {
    const { body } = await request(app).get("/api/articles?p=1").expect(200);
    expect(body.articles[0].title).toBe("A");
    expect(body.articles[9].title).toBe("Am I a cat?");
  });
  test("Status: 200, returns remaining articles when limit is greater than the total articles left", async () => {
    const { body } = await request(app)
      .get("/api/articles?limit=3&p=4")
      .expect(200);
    expect(body.articles.length).toBe(2);
  });
  test("Status: 400, handles error when limit value is invalid", async () => {
    const { body } = await request(app)
      .get("/api/articles?limit=SELECT")
      .expect(400);
    expect(body.message).toBe("Invalid limit value");
  });
  test("Status: 400, handles error when page value is invalid", async () => {
    const { body } = await request(app)
      .get("/api/articles?limit=8&p=DROP")
      .expect(400);
    expect(body.message).toBe("Invalid page value");
  });
});

describe("GET /api/articles?topic", () => {
  test("Status: 200, returns an array of articles with the specified topic", async () => {
    const { body } = await request(app)
      .get("/api/articles?topic=mitch")
      .expect(200);
    const { articles } = body;
    expect(articles.length).toBe(10);
    articles.forEach((article) => {
      expect(article.topic).toBe("mitch");
    });
  });
  test("Status: 404, handles error when topic does not exist", async () => {
    const { body } = await request(app)
      .get("/api/articles?topic=pirelli")
      .expect(404);
    expect(body.message).toBe("Topic does not exist");
  });
  test("Status: 200, returns an empty array when topic exists, but no articles have that topic", async () => {
    const { body } = await request(app)
      .get("/api/articles?topic=paper")
      .expect(200);
    expect(body.articles).toEqual([]);
  });
});

describe("GET /api/articles with queries", () => {
  test("Status: 200, articles are sorted by created_at by default if sort_by value is empty, in descending order", async () => {
    const { body } = await request(app)
      .get("/api/articles?sort_by=")
      .expect(200);
    const { articles } = body;
    expect(articles).toBeSortedBy("created_at", {
      descending: true,
    });
  });
  test("Status: 200, articles are sorted by votes in descending order (default order)", async () => {
    const { body } = await request(app)
      .get("/api/articles?sort_by=votes")
      .expect(200);
    const { articles } = body;
    expect(articles).toBeSortedBy("votes", {
      descending: true,
    });
  });
  test("Status: 200, articles are sorted by votes in ascending order", async () => {
    const { body } = await request(app)
      .get("/api/articles?sort_by=votes&order=asc")
      .expect(200);
    const { articles } = body;
    expect(articles).toBeSortedBy("votes", {
      descending: false,
    });
  });
  test("Status: 400, error handled when sort_by value is not valid", async () => {
    const { body } = await request(app)
      .get("/api/articles?sort_by=elephantos")
      .expect(400);
    expect(body.message).toBe("Sort_by value is not valid");
  });
  test("Status: 400, handles error when order value is invalid", async () => {
    const { body } = await request(app)
      .get("/api/articles?sort_by=votes&order=smallest-first")
      .expect(400);
    expect(body.message).toBe("Invalid order value");
  });
});
describe("GET /api/articles/:article_id", () => {
  test("Status: 200, returns an article by ID including comment_count", async () => {
    const expectedArticle = {
      article_id: 2,
      title: "Sony Vaio; or, The Laptop",
      topic: "mitch",
      author: "icellusedkars",
      body: "Call me Mitchell. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would buy a laptop about a little and see the codey part of the world. It is a way I have of driving off the spleen and regulating the circulation. Whenever I find myself growing grim about the mouth; whenever it is a damp, drizzly November in my soul; whenever I find myself involuntarily pausing before coffin warehouses, and bringing up the rear of every funeral I meet; and especially whenever my hypos get such an upper hand of me, that it requires a strong moral principle to prevent me from deliberately stepping into the street, and methodically knocking people’s hats off—then, I account it high time to get to coding as soon as I can. This is my substitute for pistol and ball. With a philosophical flourish Cato throws himself upon his sword; I quietly take to the laptop. There is nothing surprising in this. If they but knew it, almost all men in their degree, some time or other, cherish very nearly the same feelings towards the the Vaio with me.",
      created_at: "2020-10-16T05:03:00.000Z",
      votes: 0,
      comment_count: "0",
    };
    const { body } = await request(app).get("/api/articles/2").expect(200);
    expect(body.article).toEqual(expectedArticle);
  });
  test("Status: 200, returns an article by ID including comment_count", async () => {
    const expectedArticle = {
      article_id: 1,
      title: "Living in the shadow of a great man",
      topic: "mitch",
      author: "butter_bridge",
      body: "I find this existence challenging",
      created_at: "2020-07-09T20:11:00.000Z",
      votes: 100,
      comment_count: "17",
    };
    const { body } = await request(app).get("/api/articles/1").expect(200);
    expect(body.article).toEqual(expectedArticle);
  });
  test("Status: 404, handles error when no article exists with the given ID", async () => {
    const { body } = await request(app).get("/api/articles/15").expect(404);
    expect(body.message).toBe("Article does not exist");
  });
  test("Status: 400, handles error when Id is invalid", async () => {
    const { body } = await request(app)
      .get("/api/articles/NotAnId")
      .expect(400);
    expect(body.message).toBe("Invalid id");
  });
});

describe("GET /api/users", () => {
  test("Status: 200, returns an array of user objects", async () => {
    const { body } = await request(app).get("/api/users").expect(200);
    const users = body.users;
    expect(users.length).toBe(4);
    users.forEach((user) => {
      expect(user).toEqual(
        expect.objectContaining({
          username: expect.any(String),
          name: expect.any(String),
          avatar_url: expect.any(String),
        })
      );
    });
  });
});

describe("GET /api/users/:username", () => {
  test("Status: 200, returns an user object with the specified username", async () => {
    const { body } = await request(app).get("/api/users/rogersop").expect(200);
    const user = body.user;
    expect(user).toEqual({
      username: "rogersop",
      name: "paul",
      avatar_url: "https://avatars2.githubusercontent.com/u/24394918?s=400&v=4",
    });
  });
  test("Status: 404, handles error when username does not exist", async () => {
    const { body } = await request(app)
      .get("/api/users/dippitydoppityboop")
      .expect(404);
    expect(body.message).toBe("Username does not exist");
  });
});

describe("PATCH /api/articles/:article_id", () => {
  test("Status: 200, returns an article with votes increased ", async () => {
    const newVotes = { inc_votes: 10 };
    const { body } = await request(app)
      .patch("/api/articles/2")
      .send(newVotes)
      .expect(200);
    const expectedArticle = {
      title: "Sony Vaio; or, The Laptop",
      topic: "mitch",
      author: "icellusedkars",
      body: "Call me Mitchell. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would buy a laptop about a little and see the codey part of the world. It is a way I have of driving off the spleen and regulating the circulation. Whenever I find myself growing grim about the mouth; whenever it is a damp, drizzly November in my soul; whenever I find myself involuntarily pausing before coffin warehouses, and bringing up the rear of every funeral I meet; and especially whenever my hypos get such an upper hand of me, that it requires a strong moral principle to prevent me from deliberately stepping into the street, and methodically knocking people’s hats off—then, I account it high time to get to coding as soon as I can. This is my substitute for pistol and ball. With a philosophical flourish Cato throws himself upon his sword; I quietly take to the laptop. There is nothing surprising in this. If they but knew it, almost all men in their degree, some time or other, cherish very nearly the same feelings towards the the Vaio with me.",
      created_at: "2020-10-16T05:03:00.000Z",
      votes: 10,
    };
    expect(body.article).toEqual({
      article_id: 2,
      ...expectedArticle,
    });
  });
  test("Status: 200, returns an article with votes decreased ", async () => {
    const newVotes = { inc_votes: -15 };
    const { body } = await request(app)
      .patch("/api/articles/1")
      .send(newVotes)
      .expect(200);
    const expectedArticle = {
      title: "Living in the shadow of a great man",
      topic: "mitch",
      author: "butter_bridge",
      body: "I find this existence challenging",
      created_at: "2020-07-09T20:11:00.000Z",
      votes: 85,
    };
    expect(body.article).toEqual({
      article_id: 1,
      ...expectedArticle,
    });
  });
  test("Status: 404, handles error correctly when no article exists with the passed ID", async () => {
    const newVotes = { inc_votes: 18 };
    const { body } = await request(app)
      .patch("/api/articles/5000")
      .send(newVotes)
      .expect(404);
    expect(body.message).toBe("Article does not exist");
  });
  test("Status: 400, handles error correctly when passed an invalid ID", async () => {
    const newVotes = { inc_votes: 18 };
    const { body } = await request(app)
      .patch("/api/articles/NotAnID")
      .send(newVotes)
      .expect(400);
    expect(body.message).toBe("Bad request");
  });
  test("Status: 400, handles error correctly when passed an invalid votes value", async () => {
    const newVotes = { inc_votes: true };
    const { body } = await request(app)
      .patch("/api/articles/NotAnID")
      .send(newVotes)
      .expect(400);
    expect(body.message).toBe("Bad request");
  });
  test("Status: 400, handles error correctly when passed an object that does not include the 'inv_votes' key", async () => {
    const newVotes = { fish: true, fox: false };
    const { body } = await request(app)
      .patch("/api/articles/2")
      .send(newVotes)
      .expect(400);
    expect(body.message).toBe("Bad request");
  });
});

describe("GET /api/articles/:article_id/comments", () => {
  test("Status: 200, returns an array of comments", async () => {
    const { body } = await request(app)
      .get("/api/articles/9/comments")
      .expect(200);
    const comments = body.comments;
    expect(comments.length).toBe(2);
    comments.forEach((comment) => {
      expect(comment).toEqual(
        expect.objectContaining({
          comment_id: expect.any(Number),
          votes: expect.any(Number),
          created_at: expect.any(String),
          author: expect.any(String),
          body: expect.any(String),
        })
      );
    });
  });
  test("Status: 200, returns an empty array when the article_id exists, but has no comments", async () => {
    const { body } = await request(app)
      .get("/api/articles/2/comments")
      .expect(200);
    expect(body.comments).toEqual([]);
  });
  test("Status: 404, handles error when article_id does not exist", async () => {
    const { body } = await request(app)
      .get("/api/articles/140/comments")
      .expect(404);
    expect(body.message).toBe("Article does not exist");
  });
  test("Status: 400, handles error when article_id is invalid", async () => {
    const { body } = await request(app)
      .get("/api/articles/NotAnID/comments")
      .expect(400);
    expect(body.message).toBe("Invalid id");
  });
});

describe("POST /api/articles/:article_id/comments", () => {
  test("Status: 201, returns with the posted comment", async () => {
    const comment = {
      username: "butter_bridge",
      body: "Why are stars always in the same spot in the sky? :/",
    };
    const { body } = await request(app)
      .post("/api/articles/2/comments")
      .send(comment)
      .expect(201);
    expect(body.comment.rows[0]).toEqual({
      article_id: 2,
      body: "Why are stars always in the same spot in the sky? :/",
      author: comment.username,
      comment_id: 25,
      created_at: expect.any(String),
      votes: 0,
    });
  });
  test("Status: 404, handles error when article does not exist", async () => {
    const comment = {
      username: "butter_bridge",
      body: "Why are stars always in the same spot in the sky? :/",
    };
    const { body } = await request(app)
      .post("/api/articles/35/comments")
      .send(comment)
      .expect(404);
    expect(body.message).toBe("Article does not exist");
  });
  test("Status: 404, handles error when username does not exist in author table", async () => {
    const comment = {
      username: "dan",
      body: "Why are stars always in the same spot in the sky? :/",
    };
    const { body } = await request(app)
      .post("/api/articles/2/comments")
      .send(comment)
      .expect(404);
    expect(body.message).toBe("Username does not exist");
  });
  test("Status: 400, handles error when article id is invalid", async () => {
    const comment = {
      username: "butter_bridge",
      body: "Why are stars always in the same spot in the sky? :/",
    };
    const { body } = await request(app)
      .post("/api/articles/NotAnID/comments")
      .send(comment)
      .expect(400);
    expect(body.message).toBe("Invalid id");
  });
  test("Status: 400, handles error when username or body are missing", async () => {
    const comment = { username: "DanDan" };
    const { body } = await request(app)
      .post("/api/articles/2/comments")
      .send(comment)
      .expect(400);
    expect(body.message).toBe("Invalid comment");
  });
  test("Status: 400, handles error when username or body are missing", async () => {
    const comment = {
      body: "Why are stars always in the same spot in the sky? :/",
    };
    const { body } = await request(app)
      .post("/api/articles/2/comments")
      .send(comment)
      .expect(400);
    expect(body.message).toBe("Invalid comment");
  });
});

describe("DELETE /api/comments/:comment_id", () => {
  test("Status: 204, deletes the comment", async () => {
    await request(app).delete("/api/comments/2").expect(204);
    const comment = await db.query(
      "SELECT * FROM comments WHERE comment_id = 2"
    );
    expect(comment.rowCount).toBe(0);
  });
  test("Status: 404, handles error when comment does not exist", async () => {
    const { body } = await request(app)
      .delete("/api/comments/999182")
      .expect(404);
    expect(body.message).toBe("Comment does not exist");
  });
  test("Status: 400, handles error when comment ID is invalid", async () => {
    const { body } = await request(app)
      .delete("/api/comments/NotAnID")
      .expect(400);
    expect(body.message).toBe("Invalid id");
  });
});

describe("PATCH /api/comments/:comment_id", () => {
  test("Status: 200, returns the updated comment object with an increase in votes", async () => {
    const newVote = 12;
    const { body } = await request(app)
      .patch("/api/comments/1")
      .send({ inc_votes: newVote })
      .expect(200);
    const { comment } = body;
    expect(comment.votes).toBe(28);
  });
  test("Status: 200, returns the updated comment object with a decrease in votes", async () => {
    const newVote = -6;
    const { body } = await request(app)
      .patch("/api/comments/1")
      .send({ inc_votes: newVote })
      .expect(200);
    const { comment } = body;
    expect(comment.votes).toBe(10);
  });
  test("Status: 404, handles error when comment does not exist", async () => {
    const newVote = 10;
    const { body } = await request(app)
      .patch("/api/comments/91928")
      .send({ inc_votes: newVote })
      .expect(404);
    expect(body.message).toBe("Comment does not exist");
  });
  test("Status: 400, handles error when comment ID is invalid", async () => {
    const newVote = 10;
    const { body } = await request(app)
      .patch("/api/comments/SELECT")
      .send({ inc_votes: newVote })
      .expect(400);
    expect(body.message).toBe("Invalid id");
  });
  test("Status: 400, handles error when newVote is invalid", async () => {
    const newVote = "DELETE * FROM table";
    const { body } = await request(app)
      .patch("/api/comments/1")
      .send({ inc_votes: newVote })
      .expect(400);
    expect(body.message).toBe("Invalid new vote value");
  });
  test("Status: 400, handles error when inc_votes property is missing", async () => {
    const newVote = "DELETE * FROM table";
    const { body } = await request(app)
      .patch("/api/comments/1")
      .send({ new_name: newVote })
      .expect(400);
    expect(body.message).toBe("Invalid body");
  });
});

describe("GET endpoints", () => {
  test("Status: 200, returns an object containing all endpoints", async () => {
    const { body } = await request(app).get("/api").expect(200);
    expect(body).toHaveProperty("GET /api");
    expect(body).toHaveProperty("GET /api/articles");
    expect(body).toHaveProperty("GET /api/articles/:article_id");
    expect(body).toHaveProperty("GET /api/users");
    expect(body).toHaveProperty("GET /api/articles/:article_id/comments");
    expect(body).toHaveProperty("POST /api/articles/:article_id/comments");
    expect(body).toHaveProperty("PATCH /api/articles/:article_id");
  });
});

describe("POST /api/articles", () => {
  test("Status: 201, adds a new article to the database", async () => {
    const article = {
      author: "rogersop",
      title: "Understanding fish",
      body: "Fish are friends, not food",
      topic: "mitch",
    };
    await request(app).post("/api/articles").send(article).expect(201);
    const dbArticle = await db.query(
      "SELECT * FROM articles ORDER BY created_at DESC"
    );
    expect(dbArticle.rows[0]).toEqual({
      article_id: 13,
      votes: 0,
      created_at: expect.any(Date),
      ...article,
    });
  });
  test("Status: 201, returns the newly added article", async () => {
    const article = {
      author: "rogersop",
      title: "Understanding fish",
      body: "Fish are friends, not food",
      topic: "mitch",
    };
    const { body } = await request(app)
      .post("/api/articles")
      .send(article)
      .expect(201);
    expect(body.article).toEqual({
      article_id: 13,
      votes: 0,
      created_at: expect.any(String),
      ...article,
    });
  });
  test("Status: 400, missing keys from the article object", async () => {
    const article = {
      author: "rogersop",
      topic: "mitch",
    };
    const { body } = await request(app)
      .post("/api/articles")
      .send(article)
      .expect(400);
    expect(body.message).toBe("Article object is missing keys");
  });
  test("Status: 400, invalid article value(s)", async () => {
    const article = {
      author: 646,
      title: "Understanding fish",
      body: "Fish are friends, not food",
      topic: "mitch",
    };
    const { body } = await request(app)
      .post("/api/articles")
      .send(article)
      .expect(400);
    expect(body.message).toBe("Invalid article values");
  });
  test("Status: 404, author does not exist", async () => {
    const article = {
      author: "JimmyBob",
      title: "Understanding fish",
      body: "Fish are friends, not food",
      topic: "mitch",
    };
    const { body } = await request(app)
      .post("/api/articles")
      .send(article)
      .expect(404);
    expect(body.message).toBe("Author does not exist");
  });
  test("Status: 404, topic does not exist", async () => {
    const article = {
      author: "rogersop",
      title: "Understanding fish",
      body: "Fish are friends, not food",
      topic: "googly",
    };
    const { body } = await request(app)
      .post("/api/articles")
      .send(article)
      .expect(404);
    expect(body.message).toBe("Topic does not exist");
  });
});

describe("GET /api/article/:article_id/comments with pagination", () => {
  test("Status: 200, returns 5 comments when the limit is set to 5", async () => {
    const { body } = await request(app)
      .get("/api/articles/1/comments?limit=5")
      .expect(200);
    expect(body.comments.length).toBe(5);
  });
  test("Status: 200, returns 8 comments when the limit is set to 8", async () => {
    const { body } = await request(app)
      .get("/api/articles/1/comments?limit=8")
      .expect(200);
    expect(body.comments.length).toBe(8);
  });
  test("Status: 200, returns 10 comments when the limit is not provided", async () => {
    const { body } = await request(app)
      .get("/api/articles/1/comments")
      .expect(200);
    expect(body.comments.length).toBe(10);
  });
  test("Status: 200, starts at page 3 with limit set to 3", async () => {
    const { body } = await request(app)
      .get("/api/articles/1/comments?limit=3&p=3")
      .expect(200);
    expect(body.comments[0].body).toBe("Superficially charming");
  });
  test("Status: 200, starts at page 1", async () => {
    const { body } = await request(app)
      .get("/api/articles/1/comments?p=1")
      .expect(200);
    expect(body.comments[0].body).toBe(
      "Replacing the quiet elegance of the dark suit and tie with the casual indifference of these muted earth tones is a form of fashion suicide, but, uh, call me crazy — onyou it works."
    );
    expect(body.comments[9].body).toBe(
      "This morning, I showered for nine minutes."
    );
  });
  test("Status: 200, returns remaining comments when limit is greater than the total comments left", async () => {
    const { body } = await request(app)
      .get("/api/articles/1/comments?limit=3&p=4")
      .expect(200);
    expect(body.comments.length).toBe(3);
  });
  test("Status: 400, handles error when limit value is invalid", async () => {
    const { body } = await request(app)
      .get("/api/articles/1/comments?limit=SELECT")
      .expect(400);
    expect(body.message).toBe("Invalid limit value");
  });
  test("Status: 400, handles error when page value is invalid", async () => {
    const { body } = await request(app)
      .get("/api/articles/1/comments?limit=8&p=DROP")
      .expect(400);
    expect(body.message).toBe("Invalid page value");
  });
});

describe("POST /api/topics", () => {
  test("Status: 201, adds a new topic to the database", async () => {
    const topic = { slug: "music", description: "music is for the ears" };
    await request(app).post("/api/topics").send(topic).expect(201);
    const topic_db = await db.query("SELECT * FROM topics WHERE slug = $1", [
      "music",
    ]);
    expect(topic_db.rows[0]).toEqual({
      slug: "music",
      description: "music is for the ears",
    });
  });
  test("Status: 201, returns the newly added topic", async () => {
    const topic = { slug: "music", description: "music is for the ears" };
    const { body } = await request(app)
      .post("/api/topics")
      .send(topic)
      .expect(201);
    expect(body.topic).toEqual({
      slug: "music",
      description: "music is for the ears",
    });
  });
  test("Status: 400, missing keys from the topic object", async () => {
    const topic = { slug: "music" };
    const { body } = await request(app)
      .post("/api/topics")
      .send(topic)
      .expect(400);
    expect(body.message).toBe("Missing keys in topic body");
  });
  test("Status: 400, topic already exists", async () => {
    const topic = { slug: "paper", description: "music is for the ears" };
    const { body } = await request(app)
      .post("/api/topics")
      .send(topic)
      .expect(400);
    expect(body.message).toBe("Topic already exists");
  });
});
