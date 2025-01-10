const db = require("../config/db");

async function getAllNews() {
  return (await db.query("SELECT * FROM news ORDER BY date DESC")).rows;
}

async function addNews(title, content, link) {
  const result = await db.query(
    `INSERT INTO news (title, content, link, date)
     VALUES ($1, $2, $3, NOW())
     RETURNING *`,
    [title, content, link]
  );
  return result.rows[0];
}

async function updateNews(id, title, content, link) {
  const result = await db.query(
    `UPDATE news
     SET title=$1, content=$2, link=$3, date=NOW()
     WHERE id=$4
     RETURNING *`,
    [title, content, link, id]
  );
  return result.rows[0];
}

async function deleteNews(id) {
  const result = await db.query("DELETE FROM news WHERE id=$1 RETURNING *", [id]);
  return result.rows[0];
}

module.exports = {
  getAllNews,
  addNews,
  updateNews,
  deleteNews
};
