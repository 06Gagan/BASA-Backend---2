const express = require("express");
const router = express.Router();
const isAuthenticated = require("../middleware/auth");
const { getAllNews, addNews, updateNews, deleteNews } = require("../models/news");

// Public route to fetch all news
router.get("/", async (req, res) => {
  try {
    const news = await getAllNews();
    res.render("news", { title: "News", news });
  } catch (err) {
    console.error("Failed to fetch news:", err);
    res.status(500).send("Server error");
  }
});

// Admin routes for CRUD operations
router.post("/add", isAuthenticated, async (req, res) => {
  const { title, content, link } = req.body;
  try {
    await addNews(title, content, link || null);
    res.redirect("/admin/dashboard");
  } catch (err) {
    console.error("Failed to add news:", err);
    res.status(500).send("Server error");
  }
});

router.post("/update/:id", isAuthenticated, async (req, res) => {
  const { id } = req.params;
  const { title, content, link } = req.body;
  try {
    await updateNews(id, title, content, link || null);
    res.redirect("/admin/dashboard");
  } catch (err) {
    console.error("Failed to update news:", err);
    res.status(500).send("Server error");
  }
});

router.post("/delete/:id", isAuthenticated, async (req, res) => {
  const { id } = req.params;
  try {
    await deleteNews(id);
    res.redirect("/admin/dashboard");
  } catch (err) {
    console.error("Failed to delete news:", err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
