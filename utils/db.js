const admins = {
    "basa.backend.reset@gmail.com": {
      email: "basa.backend.reset@gmail.com",
      hashedPassword: "$2b$10$examplehashedpassword1234567890abcdef",
    },
  };
  
  const getAdminByEmail = async (email) => {
    return admins[email] || null;
  };
  
  const updateAdminPasswordInDB = async (email, hashedPassword) => {
    if (admins[email]) {
      admins[email].hashedPassword = hashedPassword;
    }
  };
  
  module.exports = { getAdminByEmail, updateAdminPasswordInDB };
  