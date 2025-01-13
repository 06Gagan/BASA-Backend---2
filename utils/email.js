const nodemailer = require("nodemailer");
const { google } = require("googleapis");

require("dotenv").config(); // Load environment variables

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
const EMAIL_USER = process.env.EMAIL_USER;

// Ensure BASE_URL is clean (no trailing slash)
const BASE_URL = (process.env.BASE_URL).replace(/\/$/, "");

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  "https://developers.google.com/oauthplayground"
);

oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const sendResetEmail = async (email, token) => {
  try {
    // Validate the token
    if (!token) {
      console.error("Error: Token is undefined or invalid.");
      return;
    }

    // Get the access token
    const accessTokenResponse = await oAuth2Client.getAccessToken();
    const accessToken = accessTokenResponse?.token || accessTokenResponse?.credentials?.access_token;

    // Create the transporter
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        type: "OAuth2",
        user: EMAIL_USER,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken,
      },
    });

    // Construct the reset URL
    const resetURL = `${BASE_URL}/reset-password?token=${token}`;

    // Send the reset email
    await transporter.sendMail({
      from: `"BASA Admin" <${EMAIL_USER}>`,
      to: email,
      subject: "Password Reset",
      html: `<p>Click <a href="${resetURL}">here</a> to reset your password.</p>`,
    });
  } catch (err) {
    console.error("Error sending reset email:", err);
  }
};

const sendConfirmationEmail = async (email) => {
  try {
    // Get the access token
    const accessTokenResponse = await oAuth2Client.getAccessToken();
    const accessToken = accessTokenResponse?.token || accessTokenResponse?.credentials?.access_token;

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        type: "OAuth2",
        user: EMAIL_USER,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken,
      },
    });

    await transporter.sendMail({
      from: `"BASA Admin" <${EMAIL_USER}>`,
      to: email,
      subject: "Password Successfully Changed",
      html: `<p>Your password has been successfully updated.</p>`,
    });

    console.log("Confirmation email sent successfully!");
  } catch (err) {
    console.error("Error sending confirmation email:", err);
  }
};

module.exports = { sendResetEmail, sendConfirmationEmail };
