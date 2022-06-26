module.exports = (app) => {
  const dailyEvalController = require("../controllers/dailyEval.controller");
  const verify = require("../middlewares/verify_token");

  app.post("/dailyEval/student/:id", verify, dailyEvalController.create);
  //student id
  app.get("/dailyEval/student/:id", verify, dailyEvalController.find);
  //evaluation id
  app.get("/dailyEval/:id", verify, dailyEvalController.findByID);
};
