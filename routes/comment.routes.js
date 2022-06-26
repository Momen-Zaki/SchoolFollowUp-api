module.exports = (app) => {
  const CommentController = require("../controllers/comment.controller");

  app.get("/comments", CommentController.find);
  app.post("/comments", CommentController.create);
  app.get("/comments/:id", CommentController.findById);
  app.put("/comments/:id", CommentController.update);
  app.delete("/comments/:id", CommentController.delete);
};
