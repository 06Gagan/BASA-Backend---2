const express = require("express");
const router = express.Router();
const isAuthenticated = require("../middleware/auth");

const {
  getAllPublications,
  addPublication,
  updatePublication,
  deletePublication,
} = require("../models/publications");

// Public route to fetch publication data
router.get("/", async (req, res) => {
  try {
    const publications = await getAllPublications(); // Fetch all publications
    res.render("publications", { title: "Publications", publications }); // Render public publications view
  } catch (err) {
    console.error("Failed to fetch publications:", err);
    res.status(500).send("Server error");
  }
});

// Admin CRUD routes (require login)
router.post("/add", isAuthenticated, async (req, res) => {
  const { title, description, publication_date, link } = req.body;
  try {
    await addPublication(title, description, publication_date, link);
    res.redirect("/admin/dashboard");
  } catch (err) {
    console.error("Failed to add publication:", err);
    res.status(500).send("Server error");
  }
});

router.post("/update/:id", isAuthenticated, async (req, res) => {
  const { id } = req.params;
  const { title, description, publication_date, link } = req.body;
  try {
    await updatePublication(id, title, description, publication_date, link);
    res.redirect("/admin/dashboard");
  } catch (err) {
    console.error("Failed to update publication:", err);
    res.status(500).send("Server error");
  }
});

router.post("/delete/:id", isAuthenticated, async (req, res) => {
  const { id } = req.params;
  try {
    await deletePublication(id);
    res.redirect("/admin/dashboard");
  } catch (err) {
    console.error("Failed to delete publication:", err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
