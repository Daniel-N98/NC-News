const db = require("../db/connection");

exports.fetchTopics = async () => {
  return db.query("SELECT * FROM topics").then((topic) => topic.rows);
};

exports.fetchArticleById = (article_id) => {
  return db
    .query(`SELECT * from articles WHERE article_id = $1;`, [article_id])
    .then((article) => {
      if (article.rows.length === 0) {
        return Promise.reject({ code: 400, message: "Invalid id" });
      }
      return article.rows[0];
    });
};
