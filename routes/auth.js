// routes/auth.js
const express = require("express");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { body, validationResult } = require("express-validator");
// Correct path assuming email.js is in utils directory
const { sendResetEmail, sendConfirmationEmail } = require("../utils/email");
const {
  getAdminPassword,
  updateAdminPassword,
  saveResetToken,
  findAdminByResetToken,
  clearResetToken,
} = require("../models/admin");

const router = express.Router();
const SALT_ROUNDS = 10; // Define salt rounds for bcrypt

// Login Route
router.get("/login", (req, res) => {
  const message = req.session.successMessage || null;
  req.session.successMessage = null; // Clear the message after rendering
  res.render("login", { title: "Admin Login", message });
});

router.post("/login", async (req, res, next) => {
  try {
    const { password } = req.body;
    const hashedPassword = await getAdminPassword(); // Fetches password for admin id=1
    if (hashedPassword && (await bcrypt.compare(password, hashedPassword))) {
      req.session.isLoggedIn = true;
      req.session.userId = 1; // Assuming admin ID is always 1
      console.log("Session created:", req.session.id);
      req.session.save((err) => { // Explicitly save session
        if (err) {
          console.error("Error saving session:", err);
          return res.render("login", {
            title: "Admin Login",
            message: { type: "danger", text: "Session error. Please try again." },
          });
        }
        console.log("Session saved successfully, redirecting to dashboard.");
        // Use return to ensure no further code execution after redirect
        return res.redirect("/admin/dashboard");
      });
    } else {
      res.render("login", {
        title: "Admin Login",
        message: { type: "danger", text: "Invalid password" },
      });
    }
  } catch (err) {
    next(err); // Pass database or bcrypt errors to error handler
  }
});


// Logout Route
router.get("/logout", (req, res, next) => {
  const sessionId = req.session.id;
  req.session.destroy((err) => {
    if (err) {
      console.error(`Error destroying session ${sessionId}:`, err);
      return next(err); // Pass error to handler
    }
    console.log(`Session ${sessionId} destroyed.`);
    // Ensure cookie is cleared
    const cookieName = req.app.get('session cookie name') || 'connect.sid';
    res.clearCookie(cookieName);
    res.redirect("/login");
  });
});


// Forget Password Route
router.get("/forget", (req, res) => {
  res.render("forget", { title: "Forgot Password", message: null });
});

router.post(
  "/forget",
  [body("email").isEmail().normalizeEmail().withMessage("Valid email is required")],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
       return res.status(400).render("forget", {
         title: "Forgot Password",
         message: { type: "danger", text: errors.array()[0].msg },
       });
    }

    try {
      const { email } = req.body;

      // Check against the configured EMAIL_USER environment variable
      if (email && process.env.EMAIL_USER && email.toLowerCase() === process.env.EMAIL_USER.toLowerCase()) {
        const token = crypto.randomBytes(32).toString("hex"); // Raw token for email link
        const hashedToken = crypto.createHash("sha256").update(token).digest("hex"); // Hashed token for DB
        const expiresAt = new Date(Date.now() + 3600000); // 1-hour expiry (Date object)

        await saveResetToken(hashedToken, expiresAt); // Save hash and expiry to DB

        console.log(`Generated reset token for ${email}, sending email...`);
        const emailResult = await sendResetEmail(email, token); // Send raw token in email

        if (emailResult.success) {
            console.log(`Reset email sent successfully to ${email}`);
            return res.render("forget", {
                title: "Forgot Password",
                message: { type: "success", text: "Password reset email sent successfully." },
            });
        } else {
             console.error(`Failed to send reset email to ${email}, clearing token. Error: ${emailResult.error}`);
             await clearResetToken(); // Clear token if email sending failed
             return res.render("forget", {
                title: "Forgot Password",
                message: { type: "danger", text: `Failed to send reset email. Please try again later.` },
             });
        }
      } else {
        // Email does not match the configured admin email
         console.log(`Password reset attempt for non-admin email: ${email}`);
        return res.render("forget", {
          title: "Forgot Password",
          message: { type: "danger", text: "Email not registered for password reset." },
        });
      }
    } catch (err) {
      console.error("Error during /forget POST:", err);
      next(err); // Pass errors to the central error handler
    }
  }
);

// Reset Password Route (GET to display form)
router.get("/reset-password", (req, res) => {
  const { token } = req.query;

  if (!token) {
    // It's better practice to show a generic message rather than confirming token absence
    return res.status(400).render("reset-password", {
      title: "Reset Password",
      token: null,
      message: { type: "danger", text: "Invalid or missing reset token." },
    });
  }

  // Render the form, passing the token
  res.render("reset-password", {
    title: "Reset Password",
    token: token, // Pass token to form action or hidden input
    message: null,
  });
});

// Reset Password Route (POST to process submission)
router.post(
  "/reset-password",
  [
    // Ensure token is present and looks like hex
    body("token").isHexadecimal().withMessage("Invalid token format."),
    body("newPassword")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long."),
    body('confirmPassword').custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Passwords do not match.');
      }
      return true;
    }),
  ],
  async (req, res, next) => {
     const errors = validationResult(req);
     const { token } = req.body; // Get token for context even if validation fails

     if (!errors.isEmpty()) {
        return res.status(400).render("reset-password", {
            title: "Reset Password",
            token: token, // Pass token back to the view
            message: { type: "danger", text: errors.array()[0].msg },
        });
     }

    try {
      const { newPassword } = req.body;
      // Hash the token from the request body to compare with DB
      const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
      console.log(`Attempting password reset with token hash: ${hashedToken}`);


      const admin = await findAdminByResetToken(hashedToken);

      if (!admin) {
        console.log(`Reset token hash not found or expired: ${hashedToken}`);
        return res.status(400).render("reset-password", {
          title: "Reset Password",
          token: null, // Don't provide the invalid token anymore
          message: { type: "danger", text: "Invalid or expired reset token. Please request a new one." },
        });
      }

      // Token is valid, hash the new password
      console.log(`Valid reset token found for admin ID: ${admin.id}. Updating password...`);
      const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
      await updateAdminPassword(hashedPassword); // This also clears the token in the DB
      console.log(`Password updated successfully for admin ID: ${admin.id}`);


      // Optionally send confirmation email
      if (process.env.EMAIL_USER) {
         try {
            console.log(`Sending password change confirmation to ${process.env.EMAIL_USER}`);
            await sendConfirmationEmail(process.env.EMAIL_USER);
            console.log("Confirmation email sent.");
         } catch(emailError){
            console.error("Failed to send confirmation email:", emailError);
            // Don't block the user flow if confirmation email fails
         }
      }

      // Set success message for login page
      req.session.successMessage = {
        type: "success",
        text: "Password updated successfully. Please log in.",
      };
      // Redirect to login only after session message is set
      return req.session.save(err => { // Save session before redirecting
          if (err) {
              console.error("Error saving session before redirect:", err);
              // Handle error, maybe redirect anyway or show error
          }
          res.redirect("/login");
      });


    } catch (err) {
      console.error("Error during /reset-password POST:", err);
      // Attempt to clear token even if an error occurred mid-process
      try { await clearResetToken(); } catch (clearErr) { console.error("Error trying to clear token after reset failure:", clearErr);}
      next(err);
    }
  }
);

module.exports = router;