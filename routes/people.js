const express = require("express");
const router = express.Router();
const isAuthenticated = require("../middleware/auth");
const { getAllPeople, addPerson, updatePerson, deletePerson } = require("../models/people");

// Public route to fetch all people
router.get("/", async (req, res) => {
  try {
    const people = await getAllPeople();
    res.render("people", { title: "People", people });
  } catch (err) {
    console.error("Failed to fetch people:", err);
    res.status(500).send("Server error");
  }
});

// Admin routes for CRUD operations
router.post("/add", isAuthenticated, async (req, res) => {
  const { name, type, category, current_position, thesis_supervised, additional_info } = req.body;
  try {
    if (!['Post-Doc', 'PhD', 'MS'].includes(type)) {
      return res.status(400).send("Invalid type");
    }
    if (!['Current', 'Past'].includes(category)) {
      return res.status(400).send("Invalid category");
    }

    const thesisSupervisedBool = thesis_supervised === "on" || thesis_supervised === "true";
    await addPerson(name, type, category, current_position, thesisSupervisedBool, additional_info);
    res.redirect("/admin/dashboard");
  } catch (err) {
    console.error("Failed to add person:", err);
    res.status(500).send("Server error");
  }
});

router.post("/update/:id", isAuthenticated, async (req, res) => {
  const { id } = req.params;
  const { name, type, category, current_position, thesis_supervised, additional_info } = req.body;

  try {
    if (!['Post-Doc', 'PhD', 'MS'].includes(type)) {
      return res.status(400).send("Invalid type");
    }
    if (!['Current', 'Past'].includes(category)) {
      return res.status(400).send("Invalid category");
    }

    const thesisSupervisedBool = thesis_supervised === "on" || thesis_supervised === "true";
    await updatePerson(id, name, type, category, current_position, thesisSupervisedBool, additional_info);
    res.redirect("/admin/dashboard");
  } catch (err) {
    console.error("Failed to update person:", err);
    res.status(500).send("Server error");
  }
});

router.post("/delete/:id", isAuthenticated, async (req, res) => {
  const { id } = req.params;
  try {
    await deletePerson(id);
    res.redirect("/admin/dashboard");
  } catch (err) {
    console.error("Failed to delete person:", err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
