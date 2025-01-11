module.exports = (req, res, next) => {
  console.log("Checking authentication:", req.session.isLoggedIn); // Debugging log
  if (req.session && req.session.isLoggedIn) {
    return next();
  }
  res.redirect("/login");
};
