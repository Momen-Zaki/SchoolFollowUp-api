module.exports = (app) => {
  const SubscribtionController = require("../controllers/subscribtion.controller");
  const verify = require("../middlewares/verify_token");

  app.get("/sudo/subscribtions", SubscribtionController.findSudo);
  app.post("/sudo/subscribtions", SubscribtionController.createSudo);
  app.get("/sudo/subscribtions/:id", SubscribtionController.findByIdSudo);
  app.put("/sudo/subscribtions/:id", SubscribtionController.updateSudo);
  app.put("/sudo/subscribtions/:id/pause", SubscribtionController.pauseSudo);
  app.put("/sudo/subscribtions/:id/active", SubscribtionController.activeSudo);
  app.delete("/sudo/subscribtions/:id", SubscribtionController.deleteSudo);

  app.get("/subscribtions", verify, SubscribtionController.find);
  // takes shcool_name, address,
  // staff_no, std_no, admin_email, admin_pass
  app.post("/subscribtions", verify, SubscribtionController.create);
  //stf_no  std_no   in body
  app.post("/subscribtions/getcost", SubscribtionController.getCost);
  //subscribtion id in params
  app.get("/subscribtions/:id", verify, SubscribtionController.findById);
  // takes optional[school_name, address, std_no, stf_no, admin_email, admin_pass]
  app.put("/subscribtions/:id", verify, SubscribtionController.update);
  //subscribtion id in params
  app.put("/subscribtions/:id/pause", verify, SubscribtionController.pause);
  //subscribtion id in params
  app.put("/subscribtions/:id/active", verify, SubscribtionController.active);
  //subscribtion id in params
  app.delete("/subscribtions/:id", verify, SubscribtionController.delete); //maybe undone

  app.post("/subscribtions/costed", verify, SubscribtionController.costed);
};
