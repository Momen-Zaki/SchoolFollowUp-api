const Post = require("../models/post");

exports.find = (req, res) => {
  let object = {
    room_id: req.body.room_id,
    usr_id: req.body.usr_id,
    content: req.body.content,
    createdat: req.body.createdat,
  };

  for (let prop in object) if (!object[prop]) delete object[prop];

  Post.find(object)
    .then((data) => {
      if (data.length > 0) res.send(data);
      res.send({ message: "No related Posts found" });
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving Posts.",
      });
    });
};

exports.findById = (req, res) => {
  Post.findById(req.params.id)
    .then((data) => {
      if (!data) {
        return res.status(404).send({
          message: "post not found with id " + req.params.id,
        });
      }
      res.send(data);
    })
    .catch((err) => {
      if (err.kind === "ObjectId") {
        return res.status(404).send({
          message: "post not found with id " + req.params.id,
        });
      }
      return res.status(500).send({
        message: "Error retrieving post with id " + req.params.id,
      });
    });
};

exports.create = (req, res) => {
  // Create a subscribtion
  const post = new Post({
    room_id: req.body.room_id,
    usr_id: req.body.usr_id,
    content: req.body.content,
    createdat: req.body.createdat,
  });

  // Save Post in the database
  post
    .save()
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while creating the post.",
      });
    });
};

exports.update = (req, res) => {
  // Find post and update it with the request body
  Post.findByIdAndUpdate(
    req.params.id,
    {
      room_id: req.body.room_id,
      usr_id: req.body.usr_id,
      content: req.body.content,
      createdat: req.body.createdat,
    },
    { new: true, omitUndefined: true }
  )
    .then((data) => {
      if (!data) {
        return res.status(404).send({
          message: "post not found with id " + req.params.id,
        });
      }
      res.send(data);
    })
    .catch((err) => {
      if (err.kind === "ObjectId") {
        return res.status(404).send({
          message: "post not found with id " + req.params.id,
        });
      }
      return res.status(500).send({
        message: "Error updating post with id " + req.params.id,
      });
    });
};

exports.delete = (req, res) => {
  Post.findByIdAndRemove(req.params.id)
    .then((data) => {
      if (!data) {
        return res.status(404).send({
          message: "subscribtion not found with id " + req.params.id,
        });
      }
      res.send({ message: "subscribtion deleted successfully!" });
    })
    .catch((err) => {
      if (err.kind === "ObjectId" || err.name === "NotFound") {
        return res.status(404).send({
          message: "subscribtion not found with id " + req.params.id,
        });
      }
      return res.status(500).send({
        message: "Could not delete subscribtion with id " + req.params.id,
      });
    });
};
