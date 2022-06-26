module.exports = (app) => {
  const PostController = require("../controllers/post.controller");

  app.get("/posts", PostController.find);
  app.post("/posts", PostController.create);
  app.get("/posts/:id", PostController.findById);
  app.put("/posts/:id", PostController.update);
  app.delete("/posts/:id", PostController.delete);
};
