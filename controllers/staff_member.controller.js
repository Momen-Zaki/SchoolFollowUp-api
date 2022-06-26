const User = require("../models/user");
const { isAdmin, isAdminOrEM } = require("../validations/validation");
const bcrypt = require("bcryptjs");
const StaffMember = require("../models/staff_member");
const { staffVal } = require("../validations/validation");
const validation = require("../validations/validation");
const { findOne } = require("../models/user");
const _None = "None";
const _admin = "admin";
const _EM = "EM";
const _staffMamber = "staff member";
const _teacher = "teacher";
const _supteacher = "supteacher";

exports.find = (req, res) => {
  let object = {
    usr_id: req.body.usr_id,
    sub_id: req.body.sub_id,
    status: req.body.status,
    role: req.body.role,
  };

  for (let prop in object) if (!object[prop]) delete object[prop];

  StaffMember.find(object)
    .then((data) => {
      if (data.length > 0) res.send(data);
      res.send({ message: "No related staff members found" });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving staff members.",
      });
    });
};

exports.findById = (req, res) => {
  StaffMember.findById(req.params.id)
    .then((data) => {
      if (!data) {
        return res.status(404).send({
          message: "StaffMember not found with id " + req.params.id,
        });
      }
      res.send(data);
    })
    .catch((err) => {
      if (err.kind === "ObjectId") {
        return res.status(404).send({
          message: "StaffMember not found with id " + req.params.id,
        });
      }
      return res.status(500).send({
        message: "Error retrieving StaffMember with id " + req.params.id,
      });
    });
};

exports.create = (req, res) => {
  // Create a StaffMember
  const StaffMember = new StaffMember({
    usr_id: req.body.usr_id,
    sub_id: req.body.sub_id,
    status: req.body.status,
  });

  // Save StaffMember in the database
  StaffMember.save()
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

exports.update = (req, res) => {
  // Find StaffMember and update it with the request body
  StaffMember.findByIdAndUpdate(
    req.params.id,
    {
      usr_id: req.body.usr_id,
      sub_id: req.body.sub_id,
      status: req.body.status,
    },
    { new: true, omitUndefined: true }
  )
    .then((data) => {
      if (!data) {
        return res.status(404).send({
          message: "StaffMember not found with id " + req.params.id,
        });
      }
      res.send(data);
    })
    .catch((err) => {
      if (err.kind === "ObjectId") {
        return res.status(404).send({
          message: "StaffMember not found with id " + req.params.id,
        });
      }
      return res.status(500).send({
        message: "Error updating StaffMember with id " + req.params.id,
      });
    });
};

exports.delete = (req, res) => {
  StaffMember.findByIdAndRemove(req.params.id)
    .then((data) => {
      if (!data) {
        return res.status(404).send({
          message: "StaffMember not found with id " + req.params.id,
        });
      }
      res.send({ message: "StaffMember deleted successfully!" });
    })
    .catch((err) => {
      if (err.kind === "ObjectId" || err.name === "NotFound") {
        return res.status(404).send({
          message: "StaffMember not found with id " + req.params.id,
        });
      }
      return res.status(500).send({
        message: "Could not delete StaffMember with id " + req.params.id,
      });
    });
};
////////////////////////////////////////////////////////////////////////////////
//not done yet
exports.findStaff = async (req, res) => {
  const user_id = req.payload._id;

  // check if user is admin
  if (!(await isAdmin(user_id)))
    res.status(402).send({ message: "Access Denied" });

  const stf = await StaffMember.findOne({ usr_id: user_id });
  if (!stf)
    res.status(400).send({ message: "this user is not a staff member" });

  let a = [];
  const stfa = await StaffMember.find({ sub_id: stf.sub_id });

  for (let i in stfa) {
    let b = {};
    let c = await User.findOne({ _id: stfa[i].usr_id });
    if(c){
    if (stfa[i].usr_id != user_id) {
      b.usr_id = stfa[i].usr_id;
      b.fname = c.fname;
      b.lname = c.lname;
      b.email = c.email;
      b.sub_id = stfa[i].sub_id;
      b.role = stfa[i].role;
      b.status = stfa[i].status;
      a.push(b);
    }
  }
  }
  res.send(a);
};

// takes _id of Staffmember in params
exports.findStaffMemberById = async (req, res) => {
  const user_id = req.payload._id;

  try {
    const stf = await StaffMember.findOne({ usr_id: req.params.id });
    const admin = await StaffMember.findOne({ usr_id: user_id });
    if (!stf)
      res.status(400).send({
        message: "StaffMember not found with id " + req.params.id,
      });

    if (!admin || admin.role != (_admin || _EM))
      res.status(400).send({
        message: "access denied",
      });

    if (stf.sub_id != admin.sub_id) {
      res.status(402).send({ message: "access denied" });
    }
  } catch (err) {
    return res.status(500).send({
      message: "Error retrieving StaffMember with id " + req.params.id,
    });
  }

  var u = {};
  const user = await User.findById(req.params.id, "-pass");

  if (!user) {
    res.status(401).send({ message: "user is not found" });
  }
  if (user.role == "staff member") {
    const stf = await StaffMember.findOne({ usr_id: req.params.id });
    u.fname = user.fname;
    u.lname = user.lname;
    u.email = user.email;
    u.role = stf.role;
    u.phone = user.phone;
    u.sub_id = stf.sub_id;
    u.status = stf.status;
    res.send(u);
  } else res.send(user);
};

//takes email pass  role status    in body
exports.createStaffMember = async (req, res) => {
  const user_id = req.payload._id;

  if (!(await validation.isUser(user_id))) {
    res.status(401).send({ message: "invalid user" });
  }
  const stf = await StaffMember.findOne({ usr_id: user_id });
  //check for admin   takes user_id
  if (!(await validation.isAdmin(user_id))) {
    res.status(401).send({ message: "invalid user" });
  }

  User.findOne({ email: req.body.email.trim() })
    .then((data) => {
      if (data) res.send({ error: "email already exists" });
    })
    .catch((err) => res.status(500).send("server error"));

  // check for role values
  if (
    req.body.role != _teacher &&
    req.body.role != _supteacher &&
    req.body.role != _EM
  )
    res.status(403).send({ message: "Invalid role" });
  else {
    // Data Validations
    const { error } = staffVal({
      role: req.body.role,
      email: req.body.email,
      pass: req.body.pass,
    });
    if (error) return res.status(400).send(error);

    // Hash password
    const salt = await bcrypt.genSalt(11);
    const hashedPassword = await bcrypt.hash(req.body.pass, salt);

    // Create a user
    const user = new User({
      fname: _None,
      lname: _None,
      email: req.body.email.trim(),
      pass: hashedPassword,
      role: _staffMamber,
      phone: _None,
    });

    // Create a StaffMember
    const staffMember = new StaffMember({
      usr_id: user._id,
      sub_id: stf.sub_id,
      status: req.body.status,
      role: req.body.role,
    });
    // Save user in the database
    user
      .save()
      .then((data) => {
        res.send({ id: data._id });
      })
      .catch((err) => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while creating the User.",
        });
      });
    // Save StaffMember in the database
    staffMember
      .save()
      .then((data) => {
        res.send(data);
      })
      .catch((err) => {
        res.status(500).send({
          message:
            err.message ||
            "Some error occurred while creating the StaffMember.",
        });
      });
  }
};

//takes usr_id from Staffmember sent in params
//optional(fname,lname,email,pass,role,status)
exports.updateStaffMember = async (req, res) => {
  const user_id = req.payload._id;

  if (!(await validation.isUser(user_id))) {
    res.status(401).send({ message: "invalid user" });
  }

  //check for admin   takes user_id
  if (!(await validation.isAdmin(user_id))) {
    res.status(401).send({ message: "invalid user" });
  }

  if (!(await validation.isMemberOfAdminsSub(req.params.id, user_id))) {
    res.status(402).send({ message: "access denied" });
  }
  const user = await User.findById(req.params.id);
  let pass = req.body.pass;
  if (!pass) {
    pass = user.pass;
  } else {
    const salt = await bcrypt.genSalt(11);
    hashedPassword = await bcrypt.hash(req.body.pass, salt);
  }
  User.findByIdAndUpdate(
    req.params.id,
    {
      fname: req.body.fname,
      lname: req.body.lname,
      email: req.body.email,
      pass: pass,
      role: _staffMamber,
      phone: req.body.phone,
    },
    { new: true, omitUndefined: true }
  )
    .then((data) => {
      if (!data) {
        return res.status(404).send({
          message: "User not found with id " + req.params.id,
        });
      }
      res.send("updated succesfully");
    })
    .catch((err) => {
      if (err.kind === "ObjectId") {
        return res.status(404).send({
          message: "User not found with id " + req.params.id,
        });
      }
      return res.status(500).send({
        message: "Error updating user with id " + req.params.id,
      });
    });

  StaffMember.update(
    { usr_id: req.params.id },
    {
      usr_id: req.body.usr_id,
      sub_id: req.body.sub_id,
      status: req.body.status,
      role: req.body.role,
    },
    { new: true, omitUndefined: true }
  )
    .then((data) => {
      if (!data) {
        return res.status(404).send({
          message: "StaffMember not found with id " + req.params.id,
        });
      }
    })
    .catch((err) => {
      if (err.kind === "ObjectId") {
        return res.status(404).send({
          message: "StaffMember not found with id " + req.params.id,
        });
      }
      return res.status(500).send({
        message: "Error updating StaffMember with id " + req.params.id,
      });
    });
  res.send("updated succesfully");
};

//takes _id of the user sent in params
exports.deleteStaffMember = async (req, res) => {
  const user_id = req.payload._id;
  try {
    const stf = await StaffMember.findOne({ usr_id: req.params.id });
    const admin = await StaffMember.findOne({ usr_id: user_id });
    if (!stf)
      res.status(400).send({
        message: "StaffMember not found with id " + req.params.id,
      });

    if (!admin)
      res.status(400).send({
        message: "access denied",
      });

    if (stf.sub_id != admin.sub_id) {
      res.status(402).send({ message: "access denied" });
    }
  } catch (err) {
    return res.status(500).send({
      message: "Error retrieving StaffMember with id " + req.params.id,
    });
  }

  const staf = await StaffMember.findOne({ usr_id: req.params.id });
  User.findByIdAndRemove(req.params.id)
    .then((data) => {
      if (!data) {
        return res.status(404).send({
          message: "User not found with id " + req.params.id,
        });
      }
      res.send({ message: `User deleted successfully!` });
    })
    .catch((err) => {
      if (err.kind === "ObjectId" || err.name === "NotFound") {
        return res.status(404).send({
          message: "User not found with id " + req.params.id,
        });
      }
      return res.status(500).send({
        message: "Could not delete user with id " + req.params.id,
      });
    });

  StaffMember.findByIdAndRemove(staf._id)
    .then((data) => {
      if (!data) {
        return res.status(404).send({
          message: "StaffMember not found with id " + req.params.id,
        });
      }
      res.send({ message: "StaffMember deleted successfully!" });
    })
    .catch((err) => {
      if (err.kind === "ObjectId" || err.name === "NotFound") {
        return res.status(404).send({
          message: "StaffMember not found with id " + req.params.id,
        });
      }
      return res.status(500).send({
        message: "Could not delete StaffMember with id " + req.params.id,
      });
    });
};
