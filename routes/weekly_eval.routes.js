module.exports = (app) => {
  const weeklyEvalController = require("../controllers/weeklyEval.controller");
  const verify = require("../middlewares/verify_token");

  app.post("/weeklyEval/student/:id", verify, weeklyEvalController.create);
  //student id
  app.get("/weeklyEval/student/:id", verify, weeklyEvalController.find);
  //evaluation id
  app.get("/weeklyEval/:id", verify, weeklyEvalController.findByID);
};
