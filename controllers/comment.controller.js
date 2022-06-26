const Comment = require("../models/comment");

exports.find = (req, res) => {
  let object = {
    post_id: req.body.sub_id,
    usr_id: req.body.usr_id,
    content: req.body.content,
    createdat: req.body.createdat,
  };

  for (let prop in object) if (!object[prop]) delete object[prop];

  Comment.find(object)
    .then((data) => {
      if (data.length > 0) res.send(data);
      res.send({ message: "No related comments found" });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving Comments.",
      });
    });
};

exports.findById = (req, res) => {
  Comment.findById(req.params.id)
    .then((data) => {
      if (!data) {
        return res.status(404).send({
          message: "comment not found with id " + req.params.id,
        });
      }
      res.send(data);
    })
    .catch((err) => {
      if (err.kind === "ObjectId") {
        return res.status(404).send({
          message: "comment not found with id " + req.params.id,
        });
      }
      return res.status(500).send({
        message: "Error retrieving comment with id " + req.params.id,
      });
    });
};

exports.create = (req, res) => {
  // Create a comment
  const comment = new Comment({
    post_id: req.body.post_id,
    usr_id: req.body.usr_id,
    content: req.body.content,
    createdat: req.body.createdat,
  });

  // Save comment in the database
  comment
    .save()
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the comment.",
      });
    });
};

exports.update = (req, res) => {
  // Find comment and update it with the request body
  Comment.findByIdAndUpdate(
    req.params.id,
    {
      post_id: req.body.post_id,
      usr_id: req.body.usr_id,
      content: req.body.content,
      createdat: req.body.createdat,
    },
    { new: true, omitUndefined: true }
  )
    .then((data) => {
      if (!data) {
        return res.status(404).send({
          message: "comment not found with id " + req.params.id,
        });
      }
      res.send(data);
    })
    .catch((err) => {
      if (err.kind === "ObjectId") {
        return res.status(404).send({
          message: "comment not found with id " + req.params.id,
        });
      }
      return res.status(500).send({
        message: "Error updating comment with id " + req.params.id,
      });
    });
};

exports.delete = (req, res) => {
  Comment.findByIdAndRemove(req.params.id)
    .then((data) => {
      if (!data) {
        return res.status(404).send({
          message: "comment not found with id " + req.params.id,
        });
      }
      res.send({ message: "comment deleted successfully!" });
    })
    .catch((err) => {
      if (err.kind === "ObjectId" || err.name === "NotFound") {
        return res.status(404).send({
          message: "comment not found with id " + req.params.id,
        });
      }
      return res.status(500).send({
        message: "Could not delete comment with id " + req.params.id,
      });
    });
};
