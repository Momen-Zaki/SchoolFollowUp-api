const { isUser, isOwnerOfNotif } = require("../validations/validation");
const UserClassroom = require("../models/user_classroom");
const Classroom = require("../models/classroom");
const notification = require("../models/notification");
const staff_member = require("../models/staff_member");
const _seen = 1;
const _unseen = 0;
const Post = require("../models/post");
const User = require("../models/user");
const Notification = require("../models/notification");


exports.find = (req, res) => {
  const body = req.body;

  let object = {
    user_id: body.user_id,
    title: body.title,
    content: body.content,
    createdat: body.createdat,
    status: body.status,
  };

  for (let prop in object) if (!object[prop]) delete object[prop];

  Notification.find(object)
    .then((data) => {
      if (data.length > 0) res.send(data);
      return res.send({ message: "No related Notifications found" });
    })
    .catch((err) => {
      return res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving Notificatoins.",
      });
    });
}; // done

exports.findById = (req, res) => {
  const id = req.params.id;

  Notification.findById(id)
    .then((data) => {
      if (!data) {
        return res.status(404).send({
          message: "notifications not found with id " + id,
        });
      }
      res.send(data);
    })
    .catch((err) => {
      if (err.kind === "ObjectId") {
        return res.status(404).send({
          message: "notifications not found with id " + id,
        });
      }
      return res.status(500).send({
        message: "Error retrieving notifications with id " + id,
      });
    });
}; // done

exports.create = async (req, res) => {
  const body = req.body;

  if (!body.user_id || !body.title || !body.content || !body.status)
    return res
      .status(403)
      .send({ message: `[user_id, title, content and status are required]` });

  const parsedStatus = parseInt(body.status);

  if (!(parsedStatus in [_seen, _unseen]))
    return res.status(403).send({ message: "Invalid status" });

  // chck that user_id exists
  if (!(await isUser(body.user_id)))
    return res.status(403).send({ message: "Invalid user id" });

  // Create a Notification
  const notification = new Notification({
    user_id: body.user_id,
    title: body.title,
    user_name: req.body.user_name,
    content: body.content,
    createdat: Date.now(),
    status: parsedStatus,
  });

  // Save Notification in the database
  notification
    .save()
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      return res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Notification.",
      });
    });
}; // done

// optional [user_id, title, content]
exports.update = async (req, res) => {
  const id = req.params.id;
  const body = req.body;

  if (body.user_id) {
    if (!(await isUser(body.user_id))) {
      return res.status(403).send({ message: "Invalid user id" });
    }
  }

  // Find notification and update it with the request body
  Notification.findByIdAndUpdate(
    id,
    {
      user_id: body.user_id,
      title: body.title,
      content: body.content,
    },
    { new: true, omitUndefined: true }
  )
    .then((data) => {
      if (!data) {
        return res.status(404).send({
          message: "notification not found with id " + id,
        });
      }
      res.send(data);
    })
    .catch((err) => {
      if (err.kind === "ObjectId") {
        return res.status(404).send({
          message: "notification not found with id " + id,
        });
      }
      return res.status(500).send({
        message: "Error updating notification with id " + id + " " + err,
      });
    });
}; // done

exports.SudoSetSeen = async (req, res) => {
  const id = req.params.id;

  // Find notification and update it with the request body
  Notification.findByIdAndUpdate(
    id,
    {
      status: _seen,
    },
    { new: true, omitUndefined: true }
  )
    .then((data) => {
      if (!data) {
        return res.status(404).send({
          message: "notification not found with id " + id,
        });
      }
      res.send(data);
    })
    .catch((err) => {
      if (err.kind === "ObjectId") {
        return res.status(404).send({
          message: "notification not found with id " + id,
        });
      }
      return res.status(500).send({
        message: "Error updating notification with id " + id,
      });
    });
}; // done

exports.SudoSetUnseen = async (req, res) => {
  const id = req.params.id;

  // Find notification and update it with the request body
  Notification.findByIdAndUpdate(
    id,
    {
      status: _unseen,
    },
    { new: true, omitUndefined: true }
  )
    .then((data) => {
      if (!data) {
        return res.status(404).send({
          message: "notification not found with id " + id,
        });
      }
      res.send(data);
    })
    .catch((err) => {
      if (err.kind === "ObjectId") {
        return res.status(404).send({
          message: "notification not found with id " + id,
        });
      }
      return res.status(500).send({
        message: "Error updating notification with id " + id,
      });
    });
}; // done

exports.delete = (req, res) => {
  const id = req.params.id;

  Notification.findByIdAndRemove(id)
    .then((data) => {
      if (!data) {
        return res.status(404).send({
          message: "notification not found with id " + id,
        });
      }
      res.send({ message: "notification deleted successfully!" });
    })
    .catch((err) => {
      if (err.kind === "ObjectId" || err.name === "NotFound") {
        return res.status(404).send({
          message: "notification not found with id " + id,
        });
      }
      return res.status(500).send({
        message: "Could not delete notification with id " + id,
      });
    });
}; // done

////////////////////////////////////////////////////////////////////////////////

exports.findNotifications = async (req, res) => {
  const user_id = req.payload._id;
  const body = req.body;

  let object = {
    user_id: user_id,
    post_id: body.post_id,
    content: body.content,
    status: body.status,
    createdat: body.createdat,
  };

  for (let prop in object) if (!object[prop]) delete object[prop];

  notification
    .find(object)
    .then((data) => {
      if (data.length > 0) res.send(data);
      return res.send(data);
    })
    .catch((err) => {
      return res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving Notificatoins.",
      });
    });
};

// done

exports.unseen = async (req, res) => {
  const user_id = req.payload._id;
  const body = req.body;

  let object = {
    user_id: user_id,
    post_id: body.post_id,
    content: body.content,
    status: "0",
    createdat: body.createdat,
  };

  for (let prop in object) if (!object[prop]) delete object[prop];

  notification
    .find(object)
    .then((data) => {
      if (data.length > 0) res.send({ number: data.length });
      res.send({ number: data.length });
    })
    .catch((err) => {
      return res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving Notificatoins.",
      });
    });
}; // done
exports.findNotificationById = async (req, res) => {
  const user_id = req.payload._id;
  const id = req.params.id;

  // check if the user is the owner of the notification
  if (!(await isOwnerOfNotif(user_id, id))) {
    return res.status(402).send({ message: "Access Denied" });
  }

  // get the notification
  Notification.findById(id)
    .then((data) => {
      if (!data) {
        return res.status(404).send({
          message: "notifications not found with id " + id,
        });
      }
      res.send(data);
    })
    .catch((err) => {
      if (err.kind === "ObjectId") {
        return res.status(404).send({
          message: "notifications not found with id " + id,
        });
      }
      return res.status(500).send({
        message: "Error retrieving notifications with id " + id,
      });
    });
}; // done

exports.createNotification = async (req, res) => {
  const user_id = req.payload._id;
  const body = req.body;

  if (!body.user_id || !body.title || !body.content || !body.status)
    return res
      .status(403)
      .send({ message: `[user_id, title, content and status are required]` });

  const parsedStatus = parseInt(body.status);

  if (!(parsedStatus in [_seen, _unseen]))
    return res.status(403).send({ message: "Invalid status" });

  // chck that user_id exists
  if (!(await isUser(body.user_id)))
    return res.status(403).send({ message: "Invalid user id" });

  // Create a Notification
  const notification = new Notification({
    user_id: body.user_id,
    title: body.title,
    content: body.content,
    createdat: Date.now(),
    status: parsedStatus,
  });

  // Save Notification in the database
  notification
    .save()
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      return res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Notification.",
      });
    });
}; // NEEDS A REDESIGN

exports.setSeen = async (req, res) => {
  const user_id = req.payload._id;
  const id = req.params.id;

  const notif = await notification.findOne({ _id: id });
  if (user_id != notif.user_id) {
    res
      .status(400)
      .send({ message: "can not change the status of this notification" });
  }
  // Find notification and update it with the request body
  notification
    .findByIdAndUpdate(
      id,
      {
        status: _seen,
      },
      { new: true, omitUndefined: true }
    )
    .then((data) => {
      if (!data) {
        return res.status(404).send({
          message: "notification not found with id " + id,
        });
      }
      res.send(data);
    })
    .catch((err) => {
      if (err.kind === "ObjectId") {
        return res.status(404).send({
          message: "notification not found with id " + id,
        });
      }
      return res.status(500).send({
        message: "Error updating notification with id " + id,
      });
    });
}; // done

exports.setUnseen = async (req, res) => {
  const user_id = req.payload._id;
  const id = req.params.id;

  // check if the user is the owner of the notification
  if (!(await isOwnerOfNotif(user_id, id))) {
    return res.status(402).send({ message: "Access Denied" });
  }

  // Find notification and update it with the request body
  Notification.findByIdAndUpdate(
    id,
    {
      status: _unseen,
    },
    { new: true, omitUndefined: true }
  )
    .then((data) => {
      if (!data) {
        return res.status(404).send({
          message: "notification not found with id " + id,
        });
      }
      res.send(data);
    })
    .catch((err) => {
      if (err.kind === "ObjectId") {
        return res.status(404).send({
          message: "notification not found with id " + id,
        });
      }
      return res.status(500).send({
        message: "Error updating notification with id " + id,
      });
    });
}; // done

exports.deleteNotification = async (req, res) => {
  const user_id = req.payload._id;
  const id = req.params.id;

  const notif = await notification.findOne({ _id: id });
  if (user_id != notif.user_id) {
    res.status(400).send({ message: "can not delete this notification" });
  }
  Notification.findByIdAndRemove(id)
    .then((data) => {
      if (!data) {
        return res.status(404).send({
          message: "notification not found with id " + id,
        });
      }
      res.send({ message: "notification deleted successfully!" });
    })
    .catch((err) => {
      if (err.kind === "ObjectId" || err.name === "NotFound") {
        return res.status(404).send({
          message: "notification not found with id " + id,
        });
      }
      return res.status(500).send({
        message: "Could not delete notification with id " + id,
      });
    });
}; //done

exports.announce = async (req, res) => {
  const user_id = req.payload._id;
  const em = await staff_member.findOne({ usr_id: user_id });
  if (!em) {
    res.status(400).send({ message: "Access denied" });
  }
  if (em.role != "admin") {
    res.status(400).send({ message: "Access denied" });
  }
  const room = await Classroom.find({ sub_id: em.sub_id });
  if (!room) {
    res.status(400).send({ message: "no classrooms found" });
  }
  const usr = await User.findById(user_id);

  for (let i in room) {
    const post = new Post({
      room_id: room[i]._id,
      usr_name: usr.fname + " " + usr.lname,
      usr_id: user_id,
      content: req.body.content,
      subject: req.body.subject,
      createdat: Date.now(),
    });

    post.save().catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while posting in classroom.",
      });
    });
  }
  res.send("announcement sent");
};

module.exports.notify = async (content, Pid, Rid,type) => {
  for (let i in Rid) {
    const notificatio = new notification({
      user_id: Rid[i],
      post_id: Pid,
      content: content,
      type:type,
      createdat: Date.now(),
      status: "0",
    });
    notificatio
      .save()
      .then((data) => {
        res.send(data);
      })
      .catch((err) => {
        return res.status(500).send({
          message:
            err.message ||
            "Some error occurred while creating the Notification.",
        });
      });
  }
};
