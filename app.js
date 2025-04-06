require("dotenv").config();
const express = require("express");
const path = require("path");
const session = require("express-session");
const bodyParser = require("body-parser");
const pgPool = require("./config/db"); // Import the configured pool
const PgSession = require("connect-pg-simple")(session); // Session store

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

// Configure persistent session store using PostgreSQL
app.use(
  session({
    store: new PgSession({
      pool: pgPool, // Use the exported pool instance
      tableName: "user_sessions", // Name of the session table (will be created automatically)
      createTableIfMissing: true, // Creates table if it doesn't exist
    }),
    secret: process.env.SESSION_SECRET, // MUST be set in .env
    resave: false, // Don't save session if unmodified
    saveUninitialized: false, // Don't create session until something stored
    cookie: {
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production (requires HTTPS)
      httpOnly: true, // Prevent client-side JS from reading the cookie
      maxAge: 1000 * 60 * 60 * 24, // Session TTL: 24 hours
      // sameSite: 'lax' // Consider adding SameSite attribute for CSRF protection
    },
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

// Research Pages Routes
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