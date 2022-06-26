var cors = require("cors");
module.exports = (app) => {
  const AuthController = require("../controllers/auth.controller");
  // fname: lname:  email: pass: role:  phone:
  app.post("/register", AuthController.register);
  //email: password:
  app.post(
    "/login",
    cors({ exposedHeaders: "auth-token" }),
    AuthController.login
  );
};
