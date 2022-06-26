module.exports = (app) => {
  const verify = require("../middlewares/verify_token");
  const ClassroomController = require("../controllers/classroom.controller");

  // super admin routes
  app.get("/sudo/classrooms", ClassroomController.find);
  app.post("/sudo/classrooms", ClassroomController.create);
  app.get("/sudo/classrooms/:id", ClassroomController.findById);
  app.put("/sudo/classrooms/:id", ClassroomController.update);
  app.delete("/sudo/classrooms/:id", ClassroomController.delete);
  app.get("/sudo/viewUsers/:id", ClassroomController.viewUsers);

  //find members or specific classroom  btrg3 el asma2 bs
  //app.get("/sudo/classrooms/:id/members", ClassroomController.findById);

  //find posts of specific classroom btrg3 posts bel comments we asm el sh5s fo2
  //app.get("/sudo/classrooms/:id/posts", ClassroomController.findById);

  //parent classrooms
  //
  app.get("/classrooms/:id", verify, ClassroomController.findClassrooms);
  //find staff classrooms
  app.get("/classrooms", verify, ClassroomController.findStaffClassrooms);

  app.post("/classrooms", verify, ClassroomController.createClassroom); //admin
  //classroom id in header
  app.get(
    "/classrooms/rooms/:id",
    verify,
    ClassroomController.findClassroomById
  );
  //classrrom id   student id(M_id) in url
  app.post(
    "/classrooms/:id/member/:M_id",
    verify,
    ClassroomController.addMembersToClassroom
  ); //admin
  //classroom id in url   optional (code name  in body)
  app.put("/classrooms/:id", verify, ClassroomController.updateClassroom); //admin

  //classrroom in url  
  app.delete("/classrooms/:id", verify, ClassroomController.deleteClassroom); //admin

  //post id in url
  app.get("/classrooms/posts/:id", verify, ClassroomController.findPostById);

  //classroom id in url
  app.post("/classrooms/:id", verify, ClassroomController.addPost);

  //post id in url
  app.post("/post/:id", verify, ClassroomController.addComment);

  //classroom id in url
  app.get("/viewUsers/:id", verify, ClassroomController.viewUsers);
  
};
