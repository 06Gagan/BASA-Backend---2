const express = require("express");
const router = express.Router();
const isAuthenticated = require("../middleware/auth");

const {
  getAllProjects,
  addProject,
  updateProject,
  deleteProject,
} = require("../models/projects");

// Public route to fetch project data
router.get("/", async (req, res) => {
  try {
    const projects = await getAllProjects(); // Fetch all projects
    res.render("projects", { title: "Projects", projects }); // Render public projects view
  } catch (err) {
    console.error("Failed to fetch projects:", err);
    res.status(500).send("Server error");
  }
});

// Admin CRUD routes (require login)
router.post("/add", isAuthenticated, async (req, res) => {
  const { title, type, category, principal_investigator, duration, agency, value_in_lakhs } = req.body;
  try {
    await addProject(title, type, category, principal_investigator, duration, agency, value_in_lakhs);
    res.redirect("/admin/dashboard");
  } catch (err) {
    console.error("Failed to add project:", err);
    res.status(500).send("Server error");
  }
});

router.post("/update/:id", isAuthenticated, async (req, res) => {
  const { id } = req.params;
  const { title, type, category, principal_investigator, duration, agency, value_in_lakhs } = req.body;
  try {
    await updateProject(id, title, type, category, principal_investigator, duration, agency, value_in_lakhs);
    res.redirect("/admin/dashboard");
  } catch (err) {
    console.error("Failed to update project:", err);
    res.status(500).send("Server error");
  }
});

router.post("/delete/:id", isAuthenticated, async (req, res) => {
  const { id } = req.params;
  try {
    await deleteProject(id);
    res.redirect("/admin/dashboard");
  } catch (err) {
    console.error("Failed to delete project:", err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
