const nodemailer = require("nodemailer");
const { google } = require("googleapis");

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
const EMAIL_USER = process.env.EMAIL_USER;

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  "https://developers.google.com/oauthplayground"
);

oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const sendResetEmail = async (email, token) => {
  const accessToken = await oAuth2Client.getAccessToken();

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      type: "OAuth2",
      user: EMAIL_USER,
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      refreshToken: REFRESH_TOKEN,
      accessToken: accessToken.token,
    },
  });

  const resetURL = `http://localhost:5000/reset-password?token=${token}`;
  await transporter.sendMail({
    from: `"BASA Admin" <${EMAIL_USER}>`,
    to: email,
    subject: "Password Reset",
    html: `<p>Click <a href="${resetURL}">here</a> to reset your password.</p>`,
  });
};

const sendConfirmationEmail = async (email) => {
  const accessToken = await oAuth2Client.getAccessToken();

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      type: "OAuth2",
      user: EMAIL_USER,
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      refreshToken: REFRESH_TOKEN,
      accessToken: accessToken.token,
    },
  });

  await transporter.sendMail({
    from: `"BASA Admin" <${EMAIL_USER}>`,
    to: email,
    subject: "Password Successfully Changed",
    html: `<p>Your password has been successfully updated.</p>`,
  });
};

module.exports = { sendResetEmail, sendConfirmationEmail };
