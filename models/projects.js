const db = require("../config/db");

async function getAllProjects() {
  return (await db.query("SELECT * FROM projects ORDER BY id ASC")).rows;
}

async function addProject(
  title,
  type,
  category,
  principal_investigator,
  duration,
  agency,
  value_in_lakhs
) {
  const result = await db.query(
    `INSERT INTO projects
     (title, type, category, principal_investigator, duration, agency, value_in_lakhs)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [title, type, category, principal_investigator, duration, agency, value_in_lakhs]
  );
  return result.rows[0];
}

async function updateProject(
  id,
  title,
  type,
  category,
  principal_investigator,
  duration,
  agency,
  value_in_lakhs
) {
  const result = await db.query(
    `UPDATE projects
     SET title=$1, type=$2, category=$3, principal_investigator=$4,
         duration=$5, agency=$6, value_in_lakhs=$7
     WHERE id=$8
     RETURNING *`,
    [title, type, category, principal_investigator, duration, agency, value_in_lakhs, id]
  );
  return result.rows[0];
}

async function deleteProject(id) {
  const result = await db.query("DELETE FROM projects WHERE id=$1 RETURNING *", [id]);
  return result.rows[0];
}

module.exports = {
  getAllProjects,
  addProject,
  updateProject,
  deleteProject,
};
