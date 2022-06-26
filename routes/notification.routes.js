module.exports = (app) => {
  const verify = require("../middlewares/verify_token");
  const NotifController = require("../controllers/notification.controller");

  // super user routes
  app.get("/sudo/notifications", NotifController.find);
  app.post("/sudo/notifications", NotifController.create);
  app.get("/sudo/notifications/:id", NotifController.findById);
  app.put("/sudo/notifications/:id", NotifController.update);
  app.put("/sudo/notifications/:id/seen", NotifController.SudoSetSeen);
  app.put("/sudo/notifications/:id/unseen", NotifController.SudoSetUnseen);
  app.delete("/sudo/notifications/:id", NotifController.delete);

  //user routes
  //student id in url
  app.get("/notifications", verify, NotifController.findNotifications);
  
  app.get("/notifications/unseen", verify, NotifController.unseen);
  //notification id in url
  app.put("/notifications/:id/seen", verify, NotifController.setSeen);
  //notification id in url
  app.delete("/notifications/:id", verify, NotifController.deleteNotification);
  //em role     -   content in body
  app.post("/announce", verify, NotifController.announce);


  //notify function for evaluation and classroom posts
  //em make announcment to all class rooms
};
