const db = require("../db/connection");

exports.fetchTopics = async () => {
  return db.query("SELECT * FROM topics").then((topic) => topic.rows);
};

exports.fetchArticleById = (article_id) => {
  return db
    .query(
      `SELECT a.*, (select COUNT(c.*) FROM comments AS c WHERE c.article_id = a.article_id) AS comment_count 
    FROM articles AS a
    WHERE a.article_id = $1`,
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
