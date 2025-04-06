const nodemailer = require("nodemailer");
const { google } = require("googleapis");
require("dotenv").config();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
const EMAIL_USER = process.env.EMAIL_USER;

const BASE_URL = (process.env.BASE_URL || "").replace(/\/$/, "");

if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN || !EMAIL_USER || !BASE_URL) {
  console.error("Error: Missing required environment variables for email service.");
}

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  "https://developers.google.com/oauthplayground"
);

oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const sendResetEmail = async (recipientEmail, resetToken) => {
  if (!recipientEmail || !resetToken) {
      console.error("Error: Missing recipient email or reset token for sendResetEmail.");
      return { success: false, error: "Missing recipient email or reset token." };
  }
  if (!EMAIL_USER) {
       console.error("Error: EMAIL_USER environment variable is not set.");
       return { success: false, error: "Email sender not configured." };
  }

  try {
    console.log("Attempting to get access token...");
    const accessTokenResponse = await oAuth2Client.getAccessToken();
    const accessToken = accessTokenResponse?.token || accessTokenResponse?.credentials?.access_token;

    if (!accessToken) {
        console.error("Error: Could not retrieve access token.", accessTokenResponse);
        return { success: false, error: "Could not retrieve access token." };
    }
    console.log("Access token retrieved successfully.");

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        type: "OAuth2",
        user: EMAIL_USER,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });

    const resetURL = `${BASE_URL}/reset-password?token=${resetToken}`;
    console.log(`Constructed Reset URL: ${resetURL}`);

    const mailOptions = {
      from: `"BASA Admin" <${EMAIL_USER}>`,
      to: recipientEmail,
      subject: "Password Reset Request",
      html: `<p>You requested a password reset.</p><p>Click <a href="${resetURL}">here</a> to reset your password.</p><p>If you did not request this, please ignore this email.</p>`,
    };

    console.log(`Sending reset email to ${recipientEmail}...`);
    const info = await transporter.sendMail(mailOptions);
    console.log("Password reset email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };

  } catch (err) {
    console.error("Error sending password reset email:", err.response?.data || err.message || err);
     return { success: false, error: err.message || "Unknown error sending email." };
  }
};

const sendConfirmationEmail = async (recipientEmail) => {
  if (!recipientEmail) {
      console.error("Error: Missing recipient email for sendConfirmationEmail.");
      return { success: false, error: "Missing recipient email." };
  }
   if (!EMAIL_USER) {
       console.error("Error: EMAIL_USER environment variable is not set.");
       return { success: false, error: "Email sender not configured." };
  }

  try {
    console.log("Attempting to get access token for confirmation email...");
    const accessTokenResponse = await oAuth2Client.getAccessToken();
    const accessToken = accessTokenResponse?.token || accessTokenResponse?.credentials?.access_token;

     if (!accessToken) {
        console.error("Error: Could not retrieve access token for confirmation.", accessTokenResponse);
        return { success: false, error: "Could not retrieve access token." };
    }
    console.log("Access token retrieved successfully for confirmation.");

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        type: "OAuth2",
        user: EMAIL_USER,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });

    const mailOptions = {
        from: `"BASA Admin" <${EMAIL_USER}>`,
        to: recipientEmail,
        subject: "Password Successfully Changed",
        html: `<p>Your password for Portfolio Website has been successfully updated.</p>`,
    };

    console.log(`Sending password change confirmation email to ${recipientEmail}...`);
    const info = await transporter.sendMail(mailOptions);
    console.log("Confirmation email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };

  } catch (err) {
    console.error("Error sending confirmation email:", err.response?.data || err.message || err);
    return { success: false, error: err.message || "Unknown error sending email." };
  }
};

module.exports = { sendResetEmail, sendConfirmationEmail };