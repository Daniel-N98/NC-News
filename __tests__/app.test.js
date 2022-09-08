const request = require("supertest");
const db = require("../db/connection");
const seed = require("../db/seeds/seed.js");
const app = require("../app.js");
const testData = require("../db/data/test-data/index");

afterAll(() => db.end());

beforeEach(() => seed(testData));

describe("GET /api/topics", () => {
  test("Status: 200, returns an array", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body }) => {
        expect(Array.isArray(body.topics)).toBe(true);
      });
  });
  test("Status: 200, returns an array of length 3", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body }) => {
        expect(body.topics.length).toBe(3);
      });
  });
  test("Status: 200, returned array contains topics", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body }) => {
        const topics = body.topics;
        expect(topics.length).toBe(3);
        topics.forEach((topic) => {
          expect(topic).toHaveProperty("slug", expect.any(String));
          expect(topic).toHaveProperty("description", expect.any(String));
        });
      });
  });
});

describe("GET /api/articles", () => {
  test("Status: 200, returns an array of all articles", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles.length).toBe(12);
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
  });
  test("Status: 200, articles are sorted by date in descending order", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toBeSortedBy("created_at", {
          descending: true,
        });
      });
  });
});

describe("GET /api/articles?topic", () => {
  test("Status: 200, returns an array of articles with the specified topic", () => {
    return request(app)
      .get("/api/articles?topic=mitch")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles.length).toBe(11);
        articles.forEach((article) => {
          expect(article.topic).toBe("mitch");
        });
      });
  });
  test("Status: 404, handles error when topic does not exist", () => {
    return request(app)
      .get("/api/articles?topic=pirelli")
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe("Topic does not exist");
      });
  });
  test("Status: 200, returns an empty array when topic exists, but no articles have that topic", () => {
    return request(app)
      .get("/api/articles?topic=paper")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toEqual([]);
      });
  });
});

describe("GET /api/articles with queries", () => {
  test("Status: 200, articles are sorted by created_at by default if sort_by value is empty, in descending order", () => {
    return request(app)
      .get("/api/articles?sort_by=")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toBeSortedBy("created_at", {
          descending: true,
        });
      });
  });
  test("Status: 200, articles are sorted by votes in descending order (default order)", () => {
    return request(app)
      .get("/api/articles?sort_by=votes")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toBeSortedBy("votes", {
          descending: true,
        });
      });
  });
  test("Status: 200, articles are sorted by votes in ascending order", () => {
    return request(app)
      .get("/api/articles?sort_by=votes&order=asc")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toBeSortedBy("votes", {
          descending: false,
        });
      });
  });
  test("Status: 400, error handled when sort_by value is not valid", () => {
    return request(app)
      .get("/api/articles?sort_by=elephantos")
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Sort_by value is not valid");
      });
  });
  test("Status: 400, handles error when order value is invalid", () => {
    return request(app)
      .get("/api/articles?sort_by=votes&order=smallest-first")
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Invalid order value");
      });
  });
});
describe("GET /api/articles/:article_id", () => {
  test("Status: 200, returns an article by ID including comment_count", () => {
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
    return request(app)
      .get("/api/articles/2")
      .expect(200)
      .then(({ body }) => {
        expect(body.article).toEqual(expectedArticle);
      });
  });
  test("Status: 200, returns an article by ID including comment_count", () => {
    const expectedArticle = {
      article_id: 1,
      title: "Living in the shadow of a great man",
      topic: "mitch",
      author: "butter_bridge",
      body: "I find this existence challenging",
      created_at: "2020-07-09T20:11:00.000Z",
      votes: 100,
      comment_count: "11",
    };
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then(({ body }) => {
        expect(body.article).toEqual(expectedArticle);
      });
  });
  test("Status: 404, handles error when no article exists with the given ID", () => {
    return request(app)
      .get("/api/articles/15")
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe("Not found");
      });
  });
  test("Status: 400, handles error when Id is invalid", () => {
    return request(app)
      .get("/api/articles/NotAnId")
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Invalid id");
      });
  });
});

describe("GET /api/users", () => {
  test("Status: 200, returns an array of user objects", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body }) => {
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
});

describe("PATCH /api/articles/:article_id", () => {
  test("Status: 200, returns an article with votes increased ", () => {
    const newVotes = { inc_votes: 10 };
    return request(app)
      .patch("/api/articles/2")
      .send(newVotes)
      .expect(200)
      .then(({ body }) => {
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
  });
  test("Status: 200, returns an article with votes decreased ", () => {
    const newVotes = { inc_votes: -15 };
    return request(app)
      .patch("/api/articles/1")
      .send(newVotes)
      .expect(200)
      .then(({ body }) => {
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
  });
  test("Status: 404, handles error correctly when no article exists with the passed ID", () => {
    const newVotes = { inc_votes: 18 };
    return request(app)
      .patch("/api/articles/5000")
      .send(newVotes)
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe("Article not found");
      });
  });
  test("Status: 400, handles error correctly when passed an invalid ID", () => {
    const newVotes = { inc_votes: 18 };
    return request(app)
      .patch("/api/articles/NotAnID")
      .send(newVotes)
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Bad request");
      });
  });
  test("Status: 400, handles error correctly when passed an invalid votes value", () => {
    const newVotes = { inc_votes: true };
    return request(app)
      .patch("/api/articles/NotAnID")
      .send(newVotes)
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Bad request");
      });
  });
  test("Status: 400, handles error correctly when passed an object that does not include the 'inv_votes' key", () => {
    const newVotes = { fish: true, fox: false };
    return request(app)
      .patch("/api/articles/2")
      .send(newVotes)
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Bad request");
      });
  });
});

describe("GET /api/articles/:article_id/comments", () => {
  test("Status: 200, returns an array of comments", () => {
    return request(app)
      .get("/api/articles/9/comments")
      .expect(200)
      .then(({ body }) => {
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
  });
  test("Status: 200, returns an empty array when the article_id exists, but has no comments", () => {
    return request(app)
      .get("/api/articles/2/comments")
      .expect(200)
      .then(({ body }) => {
        expect(body.comments).toEqual([]);
      });
  });
  test("Status: 404, handles error when article_id does not exist", () => {
    return request(app)
      .get("/api/articles/140/comments")
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe("Article does not exist");
      });
  });
  test("Status: 400, handles error when article_id is invalid", () => {
    return request(app)
      .get("/api/articles/NotAnID/comments")
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Invalid id");
      });
  });
});

describe("POST /api/articles/:article_id/comments", () => {
  test("Status: 201, returns with the posted comment", () => {
    const comment = {
      username: "butter_bridge",
      body: "Why are stars always in the same spot in the sky? :/",
    };
    return request(app)
      .post("/api/articles/2/comments")
      .send(comment)
      .expect(201)
      .then(({ body }) => {
        expect(body.comment.rows[0]).toEqual({
          article_id: 2,
          body: "Why are stars always in the same spot in the sky? :/",
          author: comment.username,
          comment_id: 19,
          created_at: expect.any(String),
          votes: 0,
        });
      });
  });
  test("Status: 404, handles error when article does not exist", () => {
    const comment = {
      username: "butter_bridge",
      body: "Why are stars always in the same spot in the sky? :/",
    };
    return request(app)
      .post("/api/articles/35/comments")
      .send(comment)
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe("Article does not exist");
      });
  });
  test("Status: 404, handles error when username does not exist in author table", () => {
    const comment = {
      username: "dan",
      body: "Why are stars always in the same spot in the sky? :/",
    };
    return request(app)
      .post("/api/articles/2/comments")
      .send(comment)
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe("Username does not exist");
      });
  });
  test("Status: 400, handles error when article id is invalid", () => {
    const comment = {
      username: "butter_bridge",
      body: "Why are stars always in the same spot in the sky? :/",
    };
    return request(app)
      .post("/api/articles/NotAnID/comments")
      .send(comment)
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Invalid id");
      });
  });
  test("Status: 400, handles error when username or body are missing", () => {
    const comment = { username: "DanDan" };
    return request(app)
      .post("/api/articles/2/comments")
      .send(comment)
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Invalid comment");
      });
  });
  test("Status: 400, handles error when username or body are missing", () => {
    const comment = {
      body: "Why are stars always in the same spot in the sky? :/",
    };
    return request(app)
      .post("/api/articles/2/comments")
      .send(comment)
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Invalid comment");
      });
  });
});

describe("DELETE /api/comments/:comment_id", () => {
  test("Status: 204, deletes the comment", () => {
    return request(app)
      .delete("/api/comments/2")
      .expect(204)
      .then(() => {
        return db
          .query("SELECT * FROM comments WHERE comment_id = 2")
          .then((comment) => {
            expect(comment.rowCount).toBe(0);
          });
      });
  });
  test("Status: 404, handles error when comment does not exist", () => {
    return request(app)
      .delete("/api/comments/999182")
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe("Comment does not exist");
      });
  });
  test("Status: 400, handles error when comment ID is invalid", () => {
    return request(app)
      .delete("/api/comments/NotAnID")
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Invalid id");
      });
  });
});

describe('Endpoints', () => {
  test('', () => {
    return request(app)
    .get('/api')
    .expect(200)
    .then(({body}) => {
    })
  })
})