const { end } = require("../db/connection");
const db = require("../db/connection");

exports.fetchTopics = async () => {
  return db.query("SELECT * FROM topics").then((topic) => topic.rows);
};

exports.fetchArticleById = (article_id) => {
  return db
    .query(
      `SELECT *, (select COUNT(*) FROM comments WHERE article_id = articles.article_id) AS comment_count 
    FROM articles
    WHERE article_id = $1`,
      [article_id]
    )
    .then((article) => {
      if (article.rows.length === 0) {
        return Promise.reject({ code: 404, message: "Not found" });
      }
      return article.rows[0];
    });
};

exports.fetchUsers = () => {
  return db.query(`SELECT * FROM users`).then((users) => users.rows);
};

exports.patchArticleById = (article_id, votes) => {
  if (!Number.parseInt(article_id) || !Number.parseInt(votes)) {
    return Promise.reject({ code: 400, message: "Bad request" });
  }
  return db
    .query("SELECT votes FROM articles WHERE article_id = $1", [article_id])
    .then((articles) => {
      if (articles.rowCount === 0) {
        return Promise.reject({ code: 404, message: "Article not found" });
      }
      return db
        .query(
          "UPDATE articles SET votes = $1 WHERE article_id = $2 RETURNING *;",
          [articles.rows[0].votes + votes, article_id]
        )
        .then((article) => {
          return article.rows[0];
        });
    });
};

exports.fetchArticles = async (request) => {
  let whereClause = "";
  let sortBy = "ORDER BY created_at";
  let orderBy = "DESC";
  const validSortByValues = [
    "title",
    "topic",
    "author",
    "body",
    "created_at",
    "votes",
    "artical_id",
  ];
  const { topic, sort_by, order } = request.query;
  if (sort_by) {
    if (validSortByValues.includes(sort_by)) {
      sortBy = `ORDER BY ${sort_by}`;
    } else {
      return Promise.reject({
        code: 400,
        message: "Sort_by value is not valid",
      });
    }
  }
  if (topic) {
    const topics = await db.query("SELECT * FROM topics WHERE slug = $1", [
      topic,
    ]);
    if (topics.rowCount === 0)
      return Promise.reject({ code: 404, message: "Topic does not exist" });
    whereClause = `WHERE topic = '${topic}'`;
  }
  if (order) {
    if (order.toUpperCase() === "ASC" || order.toUpperCase() === "DESC") {
      orderBy = order;
    } else {
      return Promise.reject({ code: 400, message: "Invalid order value" });
    }
  }
  const articles = await db.query(
    `SELECT *, (select COUNT(*) FROM comments WHERE article_id = articles.article_id) AS comment_count 
  FROM articles ${whereClause} ${sortBy} ${orderBy}`
  );
  return articles.rows;
};

exports.fetchArticleComments = async (article_id) => {
  if (isInvalidID(article_id)) {
    return Promise.reject({ code: 400, message: "Invalid id" });
  }
  const articles = await db.query(
    "SELECT article_id FROM articles WHERE article_id = $1",
    [article_id]
  );
  if (articles.rowCount === 0) {
    return Promise.reject({ code: 404, message: "Article does not exist" });
  }
  const comments = await db.query(
    `SELECT comment_id, votes, created_at, author, body FROM comments
    WHERE article_id = ${article_id}`
  );
  return comments.rows;
};

exports.postArticleComment = async (article_id, comment) => {
  if (isInvalidID(article_id)) {
    return Promise.reject({ code: 400, message: "Invalid id" });
  }
  if (!(await articleExists(article_id))) {
    return Promise.reject({ code: 404, message: "Article does not exist" });
  }
  if (!comment.hasOwnProperty("username") || !comment.hasOwnProperty("body")) {
    return Promise.reject({ code: 400, message: "Invalid comment" });
  }
  if (!(await userExists(comment.username))) {
    return Promise.reject({ code: 404, message: "Username does not exist" });
  }
  return await db.query(
    `INSERT INTO comments (article_id, author, body)
    VALUES ($1, $2, $3) RETURNING *;`,
    [article_id, comment.username, comment.body]
  );
};

exports.deleteCommentByID = async (comment_id) => {
  if (isInvalidID(comment_id)) {
    return Promise.reject({ code: 400, message: "Invalid id" });
  }
  const comments = await db.query(
    "SELECT comment_id FROM comments WHERE comment_id = $1",
    [comment_id]
  );
  if (comments.rowCount === 0) {
    return Promise.reject({ code: 404, message: "Comment does not exist" });
  }
  await db.query("DELETE FROM comments WHERE comment_id = $1", [comment_id]);
};

exports.showEndpoints = () => {
  const endpoints = require('../endpoints.json');
  return endpoints;
}

function isInvalidID(article_id) {
  return !/^[0-9]*$/.test(article_id);
}

async function userExists(username) {
  const result = await db.query(
    "SELECT username FROM users WHERE username = $1",
    [username]
  );
  return result.rowCount > 0;
}

async function articleExists(article_id) {
  const articles = await db.query(
    "SELECT article_id FROM articles WHERE article_id = $1",
    [article_id]
  );
  return articles.rowCount > 0;
}
