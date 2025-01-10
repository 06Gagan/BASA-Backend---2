const express = require("express");
const router = express.Router();
const isAuthenticated = require("../middleware/auth");

const publicationsRoutes = require("./publications");
const newsRoutes = require("./news");
const projectsRoutes = require("./projects");
const peopleRoutes = require("./people");

const { getAllPublications } = require("../models/publications");
const { getAllNews } = require("../models/news");
const { getAllProjects } = require("../models/projects");
const { getAllPeople } = require("../models/people");

// Admin Dashboard Route
router.get("/dashboard", isAuthenticated, async (req, res) => {
  try {
    const publications = await getAllPublications();
    const news = await getAllNews();
    const projects = await getAllProjects();
    const people = await getAllPeople();

    res.render("dashboard", {
      title: "Admin Dashboard",
      publications,
      news,
      projects,
      people,
    });
  } catch (err) {
    console.error("Error loading dashboard data:", err);
    res.status(500).send("Failed to load dashboard data");
  }
});

// Admin-specific CRUD routes for each section
router.use("/publications", isAuthenticated, publicationsRoutes);
router.use("/news", isAuthenticated, newsRoutes);
router.use("/projects", isAuthenticated, projectsRoutes);
router.use("/people", isAuthenticated, peopleRoutes);

module.exports = router;
