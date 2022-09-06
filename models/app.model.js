const db = require("../db/connection");

exports.fetchTopics = async () => {
  return db.query("SELECT * FROM topics").then((topic) => topic.rows);
};

exports.fetchArticleById = (article_id) => {
  return db
    .query(`SELECT * from articles WHERE article_id = $1;`, [article_id])
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

exports.patchArticleById = async (article_id, votes) => {
  if (!Number.parseInt(article_id) || !Number.parseInt(votes)) {
    return Promise.reject({ code: 400, message: "Bad request" });
  }
  let currentVotes = await db.query(
    "SELECT votes FROM articles WHERE article_id = $1",
    [article_id]
  );
  if (currentVotes.rowCount === 0) {
    return Promise.reject({ code: 404, message: "Article not found" });
  }
  currentVotes = currentVotes.rows[0].votes;
  return db
    .query(
      "UPDATE articles SET votes = $1 WHERE article_id = $2 RETURNING *;",
      [currentVotes + votes, article_id]
    )
    .then((article) => {
      return article.rows[0];
    });
};
