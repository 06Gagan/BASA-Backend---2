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

router.post("/login", async (req, res, next) => {
  try {
    const { password } = req.body;
    const hashedPassword = await getAdminPassword();
    if (hashedPassword && (await bcrypt.compare(password, hashedPassword))) {
      req.session.isLoggedIn = true;
      console.log("Session data before save:", req.session);
      req.session.save((err) => {
        if (err) {
          console.error("Error saving session:", err);
          return res.render("login", {
            title: "Admin Login",
            message: { type: "danger", text: "Session error. Try again." },
          });
        }
        console.log("Session saved successfully.");
        return res.redirect("/admin/dashboard");
      });
    } else {
      res.render("login", {
        title: "Admin Login",
        message: { type: "danger", text: "Invalid password" },
      });
    }
  } catch (err) {
    next(err);
  }
});


// Logout Route
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
    }
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

        const resetLink = `${process.env.BASE_URL}/reset-password?token=${encodeURIComponent(token)}`;
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
      const { token, newPassword } = req.body;

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
