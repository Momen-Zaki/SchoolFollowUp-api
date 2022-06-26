module.exports = (app) => {
  const verify = require("../middlewares/verify_token");
  const StfController = require("../controllers/staff_member.controller");

  // super admin routes
  app.get("/sudo/staff", StfController.find);
  app.post("/sudo/staff", StfController.create);
  app.get("/sudo/staff/:id", StfController.findById);
  app.put("/sudo/staff/:id", StfController.update);
  app.delete("/sudo/staff/:id", StfController.delete);

  // user routes
  app.get("/staff", verify, StfController.findStaff);
  //takes email pass  role status    in body
  app.post("/staff", verify, StfController.createStaffMember);
  // takes _id of Staffmember in params
  app.get("/staff/:id", verify, StfController.findStaffMemberById);
  //takes usr_id from Staffmember sent in params
  //optional(fname,lname,email,pass,role,status)
  app.put("/staff/:id", verify, StfController.updateStaffMember);
  //takes _id of the user sent in params
  app.delete("/staff/:id", verify, StfController.deleteStaffMember);
};
