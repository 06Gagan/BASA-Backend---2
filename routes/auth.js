const express = require("express");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { body, validationResult } = require("express-validator");
const { sendResetEmail } = require("../utils/email");
const { getAdminPassword, updateAdminPassword } = require("../models/admin");

const router = express.Router();
const SALT_ROUNDS = 10;

let resetTokens = {}; // Temporary in-memory store for reset tokens

// Login Route
router.get("/login", (req, res) => {
  const message = req.session.successMessage || null;
  req.session.successMessage = null; // Clear the message after rendering
  res.render("login", { title: "Admin Login", message });
});

router.post(
  "/login",
  [body("password").notEmpty().withMessage("Password is required")],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.render("login", {
          title: "Admin Login",
          message: { type: "danger", text: errors.array()[0].msg },
        });
      }

      const { password } = req.body;

      const hashedPassword = await getAdminPassword();
      if (hashedPassword) {
        const isValidPassword = await bcrypt.compare(password, hashedPassword);
        if (isValidPassword) {
          req.session.isLoggedIn = true;
          return res.redirect("/admin/dashboard");
        }
      }

      res.render("login", {
        title: "Admin Login",
        message: { type: "danger", text: "Invalid password" },
      });
    } catch (err) {
      next(err);
    }
  }
);

// Logout Route
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error(err);
    res.redirect("/login");
  });
});

// Forget Password Route
router.get("/forget", (req, res) => {
  res.render("forget", { title: "Forgot Password", message: null });
});

router.post(
  "/forget",
  [body("email").isEmail().withMessage("Valid email is required")],
  async (req, res, next) => {
    try {
      const { email } = req.body;

      if (email === process.env.EMAIL_USER) {
        const token = crypto.randomBytes(32).toString("hex");
        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
        const expiresAt = new Date(Date.now() + 3600000); // 1-hour expiry

        resetTokens[email] = { token: hashedToken, expiresAt };

        const resetLink = `http://localhost:5000/reset-password?token=${encodeURIComponent(
          token
        )}`;
        await sendResetEmail(email, resetLink);

        return res.render("forget", {
          title: "Forgot Password",
          message: { type: "success", text: "Password reset email sent." },
        });
      }

      res.render("forget", {
        title: "Forgot Password",
        message: { type: "danger", text: "Email not found" },
      });
    } catch (err) {
      next(err);
    }
  }
);

// Reset Password Route
router.get("/reset-password", (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).render("reset-password", {
      title: "Reset Password",
      token: null,
      message: { type: "danger", text: "Token is required to reset the password." },
    });
  }

  res.render("reset-password", {
    title: "Reset Password",
    token,
    message: null,
  });
});

router.post(
  "/reset-password",
  [
    body("token").notEmpty().withMessage("Token is required"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  async (req, res, next) => {
    try {
      let { token, newPassword } = req.body;

      // Extract the raw token if necessary
      if (token.includes("http")) {
        token = token.split("token=")[1];
      }

      const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

      const email = Object.keys(resetTokens).find(
        (key) => resetTokens[key]?.token === hashedToken
      );

      if (!email || resetTokens[email].expiresAt < Date.now()) {
        if (email) delete resetTokens[email];
        return res.render("reset-password", {
          title: "Reset Password",
          token: null,
          message: { type: "danger", text: "Invalid or expired token" },
        });
      }

      const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
      await updateAdminPassword(hashedPassword);

      delete resetTokens[email];
      req.session.successMessage = {
        type: "success",
        text: "Password updated successfully. Please log in.",
      };
      return res.redirect("/login");
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
