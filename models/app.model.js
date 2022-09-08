const { end } = require("../db/connection");
const db = require("../db/connection");

exports.fetchTopics = async () => {
  return db.query("SELECT * FROM topics").then((topic) => topic.rows);
};

exports.fetchArticleById = async (article_id) => {
  await getArticleIfExists(article_id);
  const articles = await db.query(
    `SELECT *, (select COUNT(*) FROM comments WHERE article_id = articles.article_id) AS comment_count 
  FROM articles
  WHERE article_id = $1`,
    [article_id]
  );
  return articles.rows[0];
};

exports.fetchUsers = () => {
  return db.query(`SELECT * FROM users`).then((users) => users.rows);
};

exports.fetchUserByUsername = async (username) => {
  return await getUserIfExists(username);
};
exports.patchArticleById = async (article_id, votes) => {
  await isValidNumber(article_id, "Bad request");
  await isValidNumber(votes, "Bad request");
  const articles = await getArticleIfExists(article_id);
  const updatedArticle = await db.query(
    "UPDATE articles SET votes = $1 WHERE article_id = $2 RETURNING *;",
    [articles.votes + votes, article_id]
  );
  return updatedArticle.rows[0];
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
  await isValidNumber(article_id, "Invalid id");
  await getArticleIfExists(article_id);
  const comments = await db.query(
    `SELECT comment_id, votes, created_at, author, body FROM comments
    WHERE article_id = ${article_id}`
  );
  return comments.rows;
};

exports.postArticleComment = async (article_id, comment) => {
  await isValidNumber(article_id, "Invalid id");
  await getArticleIfExists(article_id);
  if (!comment.hasOwnProperty("username") || !comment.hasOwnProperty("body")) {
    return Promise.reject({ code: 400, message: "Invalid comment" });
  }
  await getUserIfExists(comment.username);
  return await db.query(
    `INSERT INTO comments (article_id, author, body)
    VALUES ($1, $2, $3) RETURNING *;`,
    [article_id, comment.username, comment.body]
  );
};

exports.deleteCommentByID = async (comment_id) => {
  await isValidNumber(comment_id, "Invalid id");
  await commentExists(comment_id);
  await db.query("DELETE FROM comments WHERE comment_id = $1", [comment_id]);
};

exports.patchCommentByID = async (comment_id, body) => {
  const { inc_votes } = body;
  await isValidNumber(comment_id, "Invalid id");
  const comments = await commentExists(comment_id);

  if (!inc_votes) {
    return Promise.reject({ code: 400, message: "Invalid body" });
  }
  await isValidNumber(inc_votes, "Invalid new vote value");

  const updatedComment = await db.query(
    `UPDATE comments SET votes = ${
      comments.votes + inc_votes
    } WHERE comment_id = ${comment_id} RETURNING *;`
  );
  return updatedComment.rows[0];
};

exports.fetchEndpoints = () => {
  const endpoints = require("../endpoints.json");
  return endpoints;
};

function isValidNumber(article_id, error) {
  if (!/^[-0-9]*$/.test(article_id)) {
    return Promise.reject({ code: 400, message: error });
  }
}

async function commentExists(comment_id) {
  const comments = await db.query(
    "SELECT * FROM comments WHERE comment_id = $1",
    [comment_id]
  );
  return comments.rowCount === 0
    ? Promise.reject({ code: 404, message: "Comment does not exist" })
    : comments.rows[0];
}

async function getUserIfExists(username) {
  const users = await db.query("SELECT * FROM users WHERE username = $1", [
    username,
  ]);
  return users.rowCount === 0
    ? Promise.reject({ code: 404, message: "Username does not exist" })
    : users.rows[0];
}

async function getArticleIfExists(article_id) {
  const articles = await db.query(
    "SELECT * FROM articles WHERE article_id = $1",
    [article_id]
  );
  return articles.rowCount === 0
    ? Promise.reject({ code: 404, message: "Article does not exist" })
    : articles.rows[0];
}
