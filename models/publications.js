const db = require("../config/db");

async function getAllPublications() {
  return (
    await db.query("SELECT * FROM publications ORDER BY publication_date DESC")
  ).rows;
}

async function addPublication(title, description, publication_date, link) {
  const result = await db.query(
    `INSERT INTO publications
     (title, description, link, publication_date)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [title, description, link, publication_date]
  );
  return result.rows[0];
}

async function updatePublication(id, title, description, publication_date, link) {
  const result = await db.query(
    `UPDATE publications
     SET title=$1, description=$2, link=$3, publication_date=$4
     WHERE id=$5
     RETURNING *`,
    [title, description, link, publication_date, id]
  );
  return result.rows[0];
}

async function deletePublication(id) {
  const result = await db.query(
    "DELETE FROM publications WHERE id=$1 RETURNING *",
    [id]
  );
  return result.rows[0];
}

module.exports = {
  getAllPublications,
  addPublication,
  updatePublication,
  deletePublication
};
