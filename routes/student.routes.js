const verify = require("../middlewares/verify_token");

module.exports = (app) => {
  const StudentController = require("../controllers/student.controller");

  // super admin routes
  app.get("/sudo/students", StudentController.find);
  app.post("/sudo/students", StudentController.create);
  app.get("/sudo/students/:id", StudentController.findById);
  app.put("/sudo/students/:id", StudentController.update);
  app.delete("/sudo/students/:id", StudentController.delete);

  // user routes
  app.get("/students", verify, StudentController.findStudents); //admin
  app.get("/students/teacher", verify, StudentController.findStudent); //admin
  //takes name gender grade ssn in body
  app.post("/students", verify, StudentController.createStudent); //admin
  //takes student id in params
  app.get("/students/:id", verify, StudentController.findStudentById); //admin and its own user show detailed
  //takes student id send in params
  //optional name result grade ssn gender
  app.put("/students/:id", verify, StudentController.updateStudent); //admin only
  //takes student id send in params
  app.delete("/students/:id", verify, StudentController.deleteStudent); //admin only
  app.post("/students/connect", verify, StudentController.connect);
  app.put("/students/disconnect/:id", verify, StudentController.delconn);
};
