const {
  isUser,
  isAdmin,
  isAdminOfSub,
  getStf,
} = require("../validations/validation");
const Student = require("../models/student");
const StaffMember = require("../models/staff_member");
const UserClassroom = require("../models/user_classroom");
const Classroom = require("../models/classroom");
const Post = require("../models/post");
const User = require("../models/user");
const comm = require("../models/comment");
const { findOne } = require("../models/staff_member");
const { date } = require("@hapi/joi");
const user = require("../models/user");
const _admin = "admin";
const _supteacher = "supteacher";
const _teacher = "teacher";
const { notify } = require("./notification.controller");
exports.find = (req, res) => {
  let object = {
    sub_id: req.body.sub_id,
    code: req.body.code,
    name: req.body.name,
  };

  for (let prop in object) if (!object[prop]) delete object[prop];

  Classroom.find(object)
    .then((data) => {
      if (data.length > 0) res.send(data);
      res.send({ message: "No related Classrooms found" });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving Classrooms.",
      });
    });
};
//id in url of classroom
exports.findById = async (req, res) => {
  const classroom_id = req.params.id;

  if (!classroom_id) {
    res.status(401).send({ message: "classroom id is required" });
  }

  // find classroom
  const posts = await Post.find({ room_id: classroom_id }).catch((err) =>
    res.status(400).send({ message: "Error finding classrooms" })
  );
  res.send(posts);
};
//name sub_id code in body
exports.create = (req, res) => {
  const body = req.body;
  if (!body.sub_id || !body.name || !body.code) {
    res.status(401).send({
      message: "subscribtion id, class code and class name are required",
    });
  }
  // Create a Classroom
  const classroom = new Classroom({
    sub_id: body.sub_id,
    code: body.code,
    name: body.name,
  });

  // Save Classroom in the database
  classroom
    .save()
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Classroom.",
      });
    });
};
//id in url
exports.update = (req, res) => {
  if (!req.params.id) {
    res.status(401).send({ message: "no Classroom id delivered" });
  }
  // Find Classroom and update it with the request body
  Classroom.findByIdAndUpdate(
    req.params.id,
    {
      sub_id: req.body.sub_id,
      code: req.body.code,
      name: req.body.name,
    },
    { new: true, omitUndefined: true }
  )
    .then((data) => {
      if (!data) {
        return res.status(404).send({
          message: "Classroom not found with id " + req.params.id,
        });
      }
      res.send(data);
    })
    .catch((err) => {
      if (err.kind === "ObjectId") {
        return res.status(404).send({
          message: "Classroom not found with id " + req.params.id,
        });
      }
      return res.status(500).send({
        message: "Error updating Classroom with id " + req.params.id,
      });
    });
};
//id in url
exports.delete = (req, res) => {
  if (!req.params.id) {
    res.status(401).send({ message: "no Classroom id delivered" });
  }

  Classroom.findByIdAndRemove(req.params.id)
    .then((data) => {
      if (!data) {
        return res.status(404).send({
          message: "Classroom not found with id " + req.params.id,
        });
      }
      res.send({ message: "Classroom deleted successfully!" });
    })
    .catch((err) => {
      if (err.kind === "ObjectId" || err.name === "NotFound") {
        return res.status(404).send({
          message: "Classroom not found with id " + req.params.id,
        });
      }
      return res.status(500).send({
        message: "Could not delete Classroom with id " + req.params.id,
      });
    });
};
////////////////////////////////////////////////////////////////////////////////
// takes optional[code, name]

exports.findClassrooms = async (req, res) => {
  const body = req.body;
  const user_id = req.payload._id;
  let st = {};
  const user = await User.findOne({ _id: user_id }).catch((err) => {
    res.status(402).send({ message: "Access Denied" });
  });
  if (user.role == "parent") {
    st = await Student.findOne({ _id: req.params.id });
  }

  // find Classrooms related to sub_id
  let object = {
    sub_id: st.sub_id,
    code: body.code,
    name: body.name,
  };

  for (let prop in object) if (!object[prop]) delete object[prop];

  if (user.role == "parent") {
    // find related classrooms ids
    const rooms = await UserClassroom.find(
      { user_id: req.params.id },
      "class_id"
    ).catch((err) =>
      res.status(400).send({ message: "Error finding classrooms" })
    );

    let ids_list = [];
    for (let i in rooms) ids_list.push(rooms[i].class_id);
    // retreive classrooms
    Classroom.find({ _id: { $in: ids_list } })
      .then((data) => {
        if (data.length > 0) res.send(data);
        res.send(data);
      })
      .catch((err) => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving Classrooms.",
        });
      });
  } else {
    res.status(402).send({ message: "error retrieving classrooms" });
  }
}; // done

exports.findClassroomById = async (req, res) => {
  const classroom_id = req.params.id;
  const user_id = req.payload._id;

  if (!classroom_id) {
    res.status(401).send({ message: "classroom id is required" });
  }

  // find classroom
  const posts = await Post.find({ room_id: classroom_id }).catch((err) =>
    res.status(400).send({ message: "Error finding classrooms" })
  );
  res.send(posts);
}; // Undone

// takes  code and name in body
exports.createClassroom = async (req, res) => {
  const body = req.body;
  const user_id = req.payload._id;

  if (!body.code || !body.name)
    res.status(401).send({
      message: "class code and class name are required",
    });

  // check if the user_id exists
  if (!(await isUser(user_id)))
    res.status(401).send({ message: "Invalid user" });
  // check if user is admin
  if (!(await isAdmin(user_id)))
    res.status(402).send({ message: "Access Denied" });
  const admin = await StaffMember.findOne({ usr_id: user_id });
  // Create a classroom
  const classroom = new Classroom({
    sub_id: admin.sub_id,
    code: body.code,
    name: body.name,
  });

  // Save classroom in the database
  classroom
    .save()
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the classroom.",
      });
    });
}; //done
//optional name , code
exports.updateClassroom = async (req, res) => {
  const classroom_id = req.params.id;
  const user_id = req.payload._id;

  if (!classroom_id) {
    res.status(401).send({ message: "classroom id is required" });
  }

  // check if user is admin
  if (!(await isAdmin(user_id)))
    res.status(402).send({ message: "Access Denied" });

  const cls = await Classroom.findOne({ _id: classroom_id });
  // check if user is the admin of the classroom's subscribtion
  if (!(await isAdminOfSub(user_id, cls.sub_id)))
    res.status(402).send({ message: "Access Denied" });

  // Find StaffMember and update it with the request body
  Classroom.findByIdAndUpdate(
    req.params.id,
    {
      code: req.body.code,
      name: req.body.name,
    },
    { new: true, omitUndefined: true }
  )
    .then((data) => {
      if (!data) {
        return res.status(404).send({
          message: "classroom not found with id " + classroom_id,
        });
      }
      res.send(data);
    })
    .catch((err) => {
      if (err.kind === "ObjectId") {
        return res.status(404).send({
          message: "classroom not found with id " + classroom_id,
        });
      }
      return res.status(500).send({
        message: "Error updating classroom with id " + classroom_id,
      });
    });
}; // done

// pre: takes calssroom id sent in params
exports.deleteClassroom = async (req, res) => {
  const classroom_id = req.params.id;
  const user_id = req.payload._id;

  if (!classroom_id) {
    res.status(401).send({ message: "classroom id is required" });
  }

  // check if user is admin
  if (!(await isAdmin(user_id)))
    res.status(402).send({ message: "Access Denied" });

  const cls = await Classroom.findOne({ _id: classroom_id });
  // check if user is the admin of the classroom's subscribtion
  if (!(await isAdminOfSub(user_id, cls.sub_id)))
    res.status(402).send({ message: "Access Denied" });

  Classroom.findByIdAndRemove(classroom_id)
    .then((data) => {
      if (!data) {
        return res.status(404).send({
          message: "classroom not found with id " + classroom_id,
        });
      }
      res.send({ message: "classroom deleted successfully!" });
    })
    .catch((err) => {
      if (err.kind === "ObjectId" || err.name === "NotFound") {
        return res.status(404).send({
          message: "classroom not found with id " + classroom_id,
        });
      }
      return res.status(500).send({
        message: "Could not delete classroom with id " + classroom_id,
      });
    });
}; // done

// takes classroom id and user id sent in params
exports.addMembersToClassroom = async (req, res) => {
  const classroom_id = req.params.id;
  const user_id = req.payload._id;
  const mem_id = req.params.M_id;
  const user = await User.findOne({ _id: mem_id });
  const stf = await StaffMember.findOne({ usr_id: mem_id });
  const m_role = await Student.findOne({ parent_id: mem_id });
  const adm = await StaffMember.findOne({ usr_id: user_id });

  if (!mem_id || !classroom_id)
    res.status(401).send({
      message: "member id and classroom id are required",
    });

  const classroom = await Classroom.findById(classroom_id);
  if (!classroom) res.status(401).send({ message: "Invalid classrooom id" });
  // check if stf_id is user
  if (!(await isUser(mem_id)))
    res.status(401).send({ message: "Invalid user id" });
  // check if user is admin
  if (!(await isAdmin(user_id)))
    res.status(402).send({ message: "Access Denied" });
  if (user.role == "parent") {
    // check if both are in the same sub
    if (m_role.sub_id != adm.sub_id)
      res.status(402).send({ message: "Not same subscribtion" });
  }
  if (user.role == "staff member") {
    if (stf.sub_id != null)
      if (stf.sub_id != adm.sub_id)
        res.status(402).send({ message: "Not same subscribtion" });
  }

  // add stf to classroom
  const user_classroom = new UserClassroom({
    user_id: mem_id,
    class_id: classroom_id,
  });

  user_classroom
    .save()
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the StaffMember.",
      });
    });
};
// done
exports.findPostById = async (req, res) => {
  const postid = req.params.id;
  const user_id = req.payload._id;

  if (!postid) {
    res.status(401).send({ message: "classroom id is required" });
  }

  // find classroom
  const post = await Post.findOne({ _id: postid }).catch((err) =>
    res.status(400).send({ message: "Error finding post" })
  );
  const comments = await comm
    .find({ post_id: postid })
    .catch((err) => res.status(400).send({ message: "Error finding post" }));
  res.send({ post, comments });
}; //done

exports.addPost = async (req, res) => {
  const user_id = req.payload._id;
  const usr = await User.findOne({ _id: user_id });

  const post = new Post({
    room_id: req.params.id,
    usr_name: usr.fname + " " + usr.lname,
    usr_id: user_id,
    content: req.body.content,
    subject: req.body.subject,
    createdat: Date.now(),
  });

  post
    .save()
    .then((data) => {})
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while finding post.",
      });
    });
  const s = await UserClassroom.find({ class_id: req.params.id });
  const a = [];
  const g = [];

  for (let i in s) {
    const x = await Student.findOne({ _id: s[i].user_id });
    a.push(x);
  }

  for (let i in a) {
    if (a[i].parent_id != user_id) g.push(a[i].parent_id);
  }

  const q = await Classroom.findById(req.params.id);
  const b = "new post has been added to " + q.name + " classroom";
  notify(b, post._id, g, "p");
  res.send("done");
}; //done

exports.addComment = async (req, res) => {
  const user_id = req.payload._id;
  const usr = await User.findOne({ _id: user_id });

  const post = new comm({
    post_id: req.params.id,
    usr_name: usr.fname + " " + usr.lname,
    usr_id: user_id,
    content: req.body.content,
    createdat: Date.now(),
  });

  post
    .save()
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the StaffMember.",
      });
    });
};

exports.viewUsers = async (req, res) => {
  let users_list = [];
  const room = await Classroom.findOne({ _id: req.params.id });
  if (!room) {
    res.status(401).send({ message: "classroom id is wrong" });
  }
  const ids = await UserClassroom.find({ class_id: req.params.id });
  if (!ids) {
    res.status(401).send({ message: "no members found" });
  }

  for (let i in ids) {
    const std = await Student.findOne({ _id: ids[i].user_id });
    users_list.push(std);
  }
  res.send({ users_list: users_list });
};

exports.findStaffClassrooms = async (req, res) => {
  const body = req.body;
  const user_id = req.payload._id;
  let st = {};
  const user = await User.findOne({ _id: user_id }).catch((err) => {
    res.status(402).send({ message: "Access Denied" });
  });

  if (user.role == "staff member") {
    st = await StaffMember.findOne({ usr_id: user_id });
  }

  if (user.role == "parent") {
    res.status(402).send({ message: "error retrieving classrooms" });
  }
  // find Classrooms related to sub_id
  let object = {
    sub_id: st.sub_id,
    code: body.code,
    name: body.name,
  };

  for (let prop in object) if (!object[prop]) delete object[prop];

  if (st.role == _admin) {
    Classroom.find(object)
      .then((data) => {
        if (data.length > 0) res.send(data);
        res.send({ message: "No related Classrooms found" });
      })
      .catch((err) => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving Classrooms.",
        });
      });
  } else if (st.role == _teacher || _supteacher) {
    // find related classrooms ids
    const rooms = await UserClassroom.find(
      { user_id: user_id },
      "class_id"
    ).catch((err) =>
      res.status(400).send({ message: "Error finding classrooms" })
    );

    let ids_list = [];
    for (let i in rooms) ids_list.push(rooms[i].class_id);
    // retreive classrooms
    Classroom.find({ _id: { $in: ids_list } })
      .then((data) => {
        if (data.length > 0) res.send(data);
        res.send(data);
      })
      .catch((err) => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving Classrooms.",
        });
      });
  } else {
    res.status(402).send({ message: "error retrieving classrooms" });
  }
};
