module.exports = (app) => {
  const UsersControllers = require("../controllers/user.controller");

  const verify = require("../middlewares/verify_token");

  app.post("/sudo/users", UsersControllers.create);
  app.get("/sudo/users", UsersControllers.findSudo);
  app.get("/sudo/users/:id", UsersControllers.findUserByIdSudo);
  app.put("/sudo/users/:id", UsersControllers.updateSudo);
  app.delete("/sudo/users/:id", UsersControllers.deleteSudo);

  app.get("/users/", UsersControllers.find);
  app.get("/users/profile", verify, UsersControllers.findUserById);
  app.get("/users/role", verify, UsersControllers.staffrole);
  app.put("/users/profile", verify,UsersControllers.update);
  app.delete("/users/:id", UsersControllers.delete);
};
