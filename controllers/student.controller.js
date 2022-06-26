const {
  isAdmin,
  isAdminofStudent,
  stdval,
} = require("../validations/validation");
const StaffMember = require("../models/staff_member");
const Student = require("../models/student");
const User = require("../models/user");
const Sub = require("../models/subscribtion");

const _parent = "parent";
const _none = "None";

exports.find = (req, res) => {
  let object = {
    usr_id: req.body.usr_id,
    sub_id: req.body.sub_id,
    name: req.body.name,
    result: req.body.result,
    grade: req.body.grade,
    gender: req.body.gender,
    ssn: req.body.ssn,
  };

  for (let prop in object) if (!object[prop]) delete object[prop];

  Student.find(object)
    .then((data) => {
      if (data.length > 0) res.send(data);
      res.send({ message: "No related students found" });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving students.",
      });
    });
};

exports.findById = (req, res) => {
  Student.findById(req.params.id)
    .then((data) => {
      if (!data) {
        return res.status(404).send({
          message: "Student not found with id " + req.params.id,
        });
      }
      res.send(data);
    })
    .catch((err) => {
      if (err.kind === "ObjectId") {
        return res.status(404).send({
          message: "Student not found with id " + req.params.id,
        });
      }
      return res.status(500).send({
        message: "Error retrieving Student with id " + req.params.id,
      });
    });
};

exports.create = (req, res) => {
  // Create a Student
  const student = new Student({
    parent_id: _none,
    result: _none,
    ssn: _none,
    name: req.body.name,
    grade: req.body.grade,
    gender: req.body.gender,
  });

  // Save Student in the database
  student
    .save()
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Student.",
      });
    });
};

exports.update = (req, res) => {
  // Find student and update it with the request body
  Student.findByIdAndUpdate(
    req.params.id,
    {
      parent_id: req.body.parent_id,
      sub_id: req.body.sub_id,
      name: req.body.name,
      result: req.body.result,
      grade: req.body.grade,
      gender: req.body.gender,
      ssn: req.body.ssn,
    },
    { new: true, omitUndefined: true }
  )
    .then((data) => {
      if (!data) {
        return res.status(404).send({
          message: "student not found with id " + req.params.id,
        });
      }
      res.send(data);
    })
    .catch((err) => {
      if (err.kind === "ObjectId") {
        return res.status(404).send({
          message: "student not found with id " + req.params.id,
        });
      }
      return res.status(500).send({
        message: "Error updating student with id " + req.params.id,
      });
    });
};

exports.delete = (req, res) => {
  Student.findByIdAndRemove(req.params.id)
    .then((data) => {
      if (!data) {
        return res.status(404).send({
          message: "Student not found with id " + req.params.id,
        });
      }
      res.send({ message: "Student deleted successfully!" });
    })
    .catch((err) => {
      if (err.kind === "ObjectId" || err.name === "NotFound") {
        return res.status(404).send({
          message: "Student not found with id " + req.params.id,
        });
      }
      return res.status(500).send({
        message: "Could not delete Student with id " + req.params.id,
      });
    });
};
////////////////////////////////////////////////////////////////////////////////
//takes nothing
exports.findStudents = async (req, res) => {
  const user_id = req.payload._id;
  const usr = await User.findOne({ _id: user_id });
  if (usr.role == "staff member") {
    // check if user is admin
    if (!(await isAdmin(user_id)))
      res.status(402).send({ message: "Access Denied" });

    const stf = await StaffMember.findOne({ usr_id: user_id });
    if (!stf)
      res.status(400).send({ message: "this user is not a staff member" });

    let object = {
      usr_id: req.body.usr_id,
      sub_id: stf.sub_id,
      name: req.body.name,
      result: req.body.result,
      grade: req.body.grade,
      gender: req.body.gender,
      ssn: req.body.ssn,
    };

    for (let prop in object) if (!object[prop]) delete object[prop];

    Student.find(object)
      .then((data) => {
        if (data.length > 0) res.send(data);
        res.send({ message: "No related students found" });
      })
      .catch((err) => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving students.",
        });
      });
  } else if (usr.role == _parent) {
    const std = await Student.find({ parent_id: user_id });
    res.send(std);
  } else {
    res.status(402).send({ message: "Access Denied" });
  }
};
let result = {};
//takes student id in params
exports.findStudentById = async (req, res) => {
  const user_id = req.payload._id;
  // check if admin of requested user
  const std = await Student.findOne({ _id: req.params.id });
  if (user_id == std.parent_id) {
    User.findById(std.parent_id).then((data1) => {
      if (!data1) {
        return res.status(404).send({
          message: "Student not found with id " + req.params.id,
        });
      }
      result.parent = data1;
    });
  }
  if (
    !(await isAdminofStudent(req.params.id, user_id)) &&
    user_id != std.parent_id
  ) {
    res.status(402).send({ message: "Access Denied" });
  }

  Sub.findById(std.sub_id).then((data2) => {
    if (!data2) {
      return res.status(404).send({
        message: "Student not found with id " + req.params.id,
      });
    }
    result.subs = data2;
  });
  Student.findById(req.params.id)
    .then((data) => {
      if (!data) {
        return res.status(404).send({
          message: "Student not found with id " + req.params.id,
        });
      }

      result.student = data;
      res.send(result);
    })
    .catch((err) => {
      if (err.kind === "ObjectId") {
        return res.status(404).send({
          message: "Student not found with id " + req.params.id,
        });
      }
      return res.status(500).send({
        message: "Error retrieving Student with id " + req.params.id,
      });
    });
};
//takes name gender grade ssn in body
exports.createStudent = async (req, res) => {
  const user_id = req.payload._id;

  // check if user is admin
  if (!(await isAdmin(user_id)))
    res.status(402).send({ message: "Access Denied" });

  const stf = await StaffMember.findOne({ usr_id: user_id });
  if (!stf)
    res.status(400).send({ message: "this user is not a staff member" });
  // Data Validations
  const { error } = stdval({
    name: req.body.name,
    gender: req.body.gender,
    grade: req.body.grade,
    ssn: req.body.ssn,
  });
  if (error) return res.status(400).send(error);

  if (req.body.gender != "male" && req.body.gender != "female") {
    res.status(400).send({ message: "please enter a valid gender" });
  }
  // Create a Student
  const student = new Student({
    parent_id: _none,
    sub_id: stf.sub_id,
    result: _none,
    ssn: req.body.ssn,
    name: req.body.name,
    grade: req.body.grade,
    gender: req.body.gender,
  });

  // Save Student in the database
  student
    .save()
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Student.",
      });
    });
};
//takes student id send in params
//optional name result grade ssn gender
exports.updateStudent = async (req, res) => {
  const user_id = req.payload._id;
  const stf = await StaffMember.findOne({ usr_id: user_id });
  if (!stf)
    res.status(400).send({ message: "this user is not a staff member" });
  if (
    !(await isAdminofStudent(req.params.id, user_id)) &&
    user_id != std.parent_id
  ) {
    res.status(402).send({ message: "Access Denied" });
  }
  const a = await Student.findById(req.params.id);
  let c = req.body.gender;
  if (!c) {
    c = a.gender;
  }

  if (c != "male" && c != "female") {
    res.status(400).send({ message: "please enter a valid gender" });
  }
  // Find student and update it with the request body

  Student.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      result: req.body.result,
      grade: req.body.grade,
      gender: req.body.gender,
      ssn: req.body.ssn,
    },
    { new: true, omitUndefined: true }
  )
    .then((data) => {
      if (!data) {
        return res.status(404).send({
          message: "student not found with id " + req.params.id,
        });
      }
      res.send(data);
    })
    .catch((err) => {
      if (err.kind === "ObjectId") {
        return res.status(404).send({
          message: "student not found with id " + req.params.id,
        });
      }
      return res.status(500).send({
        message: "Error updating student with id " + req.params.id,
      });
    });
};
//takes student id send in header
exports.deleteStudent = async (req, res) => {
  user_id = req.payload._id;
  if (!(await isAdminofStudent(req.params.id, user_id))) {
    res.status(402).send({ message: "Access Denied" });
  }
  Student.findByIdAndRemove(req.params.id)
    .then((data) => {
      if (!data) {
        return res.status(404).send({
          message: "Student not found with id " + req.params.id,
        });
      }
      res.send({ message: "Student deleted successfully!" });
    })
    .catch((err) => {
      if (err.kind === "ObjectId" || err.name === "NotFound") {
        return res.status(404).send({
          message: "Student not found with id " + req.params.id,
        });
      }
      return res.status(500).send({
        message: "Could not delete Student with id " + req.params.id,
      });
    });
};
//takes ssn
//missin ssn validation
exports.connect = async (req, res) => {
  user_id = req.payload._id;
  const prt = await User.findOne({ _id: user_id });
  if (!prt) res.status(400).send({ message: "this user is not found" });

  if (!prt.role == _parent)
    res.status(400).send({ message: "this user in not a parent" });

  const std = await Student.findOne({ ssn: req.body.ssn });
  if (!std) res.status(400).send({ message: "student not found" });

  Student.findByIdAndUpdate(
    std._id,

    {
      parent_id: user_id,
    },
    { new: true, omitUndefined: true }
  )
    .then((data) => {
      if (!data) {
        return res.status(404).send({
          message: "student not found with id " + std._id,
        });
      }
      res.send(data);
    })
    .catch((err) => {
      if (err.kind === "ObjectId") {
        return res.status(404).send({
          message: "student not found with id d" + std._id,
        });
      }
      return res.status(500).send({
        message: "Error updating student with id " + std._id,
      });
    });
};
//takes student id send in header
exports.delconn = async (req, res) => {
  user_id = req.payload._id;
  const std = await Student.findById(req.params.id);
  if (!std) res.status(400).send({ message: "student not found" });
  if (std.parent_id != user_id)
    res.status(402).send({ message: "Access Denied" });
  Student.findByIdAndUpdate(
    req.params.id,

    {
      parent_id: _none,
    },
    { new: true, omitUndefined: true }
  )
    .then((data) => {
      if (!data) {
        return res.status(404).send({
          message: "student not found with id " + req.params.id,
        });
      }
      res.send(data);
    })
    .catch((err) => {
      if (err.kind === "ObjectId") {
        return res.status(404).send({
          message: "student not found with id d" + req.params.id,
        });
      }
      return res.status(500).send({
        message: "Error updating student with id " + req.params.id,
      });
    });
};

exports.findStudent = async (req, res) => {
  const user_id = req.payload._id;
  const usr = await User.findOne({ _id: user_id });
  if (usr.role == "staff member") {
    // check if user is admin

    const stf = await StaffMember.findOne({ usr_id: user_id });
    if (!stf)
      res.status(400).send({ message: "this user is not a staff member" });
   

    let object = {
      usr_id: req.body.usr_id,
      sub_id: stf.sub_id,
      name: req.body.name,
      result: req.body.result,
      grade: req.body.grade,
      gender: req.body.gender,
      ssn: req.body.ssn,
    };

    for (let prop in object) if (!object[prop]) delete object[prop];

    Student.find(object)
      .then((data) => {
        if (data.length > 0) res.send(data);
        res.send({ message: "No related students found" });
      })
      .catch((err) => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving students.",
        });
      });
  } else {
    res.status(402).send({ message: "Access Denied" });
  }
};
