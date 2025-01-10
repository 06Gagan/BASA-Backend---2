require("dotenv").config();
const express = require("express");
const path = require("path");
const session = require("express-session");
const bodyParser = require("body-parser");

const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const projectsRoutes = require("./routes/projects");
const peopleRoutes = require("./routes/people");
const publicationsRoutes = require("./routes/publications");
const newsRoutes = require("./routes/news");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "default-secret",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === "production" },
  })
);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Routes for Static Pages
app.get("/", (req, res) => {
  res.render("home", { title: "Home" });
});

app.get("/about", (req, res) => {
  res.render("aboutMe", { title: "About Me" });
});

app.get("/teaching", (req, res) => {
  res.render("teaching", { title: "Teaching" });
});

//research pages routes

app.get("/research/evaporation-driven-self-assembly", (req, res) => {
  res.render("research/evaporation-driven-self-assembly");
});

app.get("/research/structure-rheology-colloids", (req, res) => {
  res.render("research/structure-rheology-colloids");
});

app.get("/research/desiccation-cracks", (req, res) => {
  res.render("research/desiccation-cracks");
});

app.get("/research/hetero-aggregation", (req, res) => {
  res.render("research/hetero-aggregation");
});

app.get("/research/new-materials", (req, res) => {
  res.render("research/new-materials");
});

app.get("/research/environmental-interfaces", (req, res) => {
  res.render("research/environmental-interfaces");
});

app.get("/research/image-processing", (req, res) => {
  res.render("research/image-processing");
});

app.get("/research/emulsion-fuels", (req, res) => {
  res.render("research/emulsion-fuels");
});

// Existing Routes
app.use("/", authRoutes);
app.use("/admin", adminRoutes);
app.use("/projects", projectsRoutes);
app.use("/people", peopleRoutes);
app.use("/publications", publicationsRoutes);
app.use("/news", newsRoutes);

// Centralized Error Handling
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
