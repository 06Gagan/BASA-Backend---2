const db = require("../config/db");

// Fetch all people
async function getAllPeople() {
  try {
    const result = await db.query("SELECT * FROM people ORDER BY id ASC");
    return result.rows;
  } catch (err) {
    console.error("Error fetching people:", err);
    throw err;
  }
}

// Add a new person
async function addPerson(
  name,
  type,
  category,
  current_position,
  thesis_supervised,
  additional_info
) {
  try {
    const result = await db.query(
      `INSERT INTO people (name, type, category, current_position, thesis_supervised, additional_info)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name, type, category, current_position, thesis_supervised, additional_info]
    );
    return result.rows[0];
  } catch (err) {
    console.error("Error adding person:", err);
    throw err;
  }
}

// Update an existing person
async function updatePerson(
  id,
  name,
  type,
  category,
  current_position,
  thesis_supervised,
  additional_info
) {
  try {
    const result = await db.query(
      `UPDATE people
       SET name = $1, type = $2, category = $3, current_position = $4,
           thesis_supervised = $5, additional_info = $6
       WHERE id = $7
       RETURNING *`,
      [name, type, category, current_position, thesis_supervised, additional_info, id]
    );
    return result.rows[0];
  } catch (err) {
    console.error("Error updating person:", err);
    throw err;
  }
}

// Delete a person
async function deletePerson(id) {
  try {
    const result = await db.query(
      "DELETE FROM people WHERE id = $1 RETURNING *",
      [id]
    );
    return result.rows[0];
  } catch (err) {
    console.error("Error deleting person:", err);
    throw err;
  }
}

module.exports = {
  getAllPeople,
  addPerson,
  updatePerson,
  deletePerson,
};
