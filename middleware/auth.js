module.exports = (req, res, next) => {
  console.log("Session in middleware:", req.session);
  if (req.session && req.session.isLoggedIn) {
    return next();
  }
  res.redirect("/login");
};
