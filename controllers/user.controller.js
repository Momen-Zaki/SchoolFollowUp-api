const User = require("../models/user");
const StaffMember = require("../models/staff_member");
const bcrypt = require("bcryptjs");
const {
  isUser,
  registerValidations,
  authorize,
} = require("../validations/validation");

// sudo user routes
exports.findSudo = (req, res) => {
  let object = {
    fname: req.body.fname,
    lname: req.body.lname,
    email: req.body.email,
    phone: req.body.phone,
    role: req.body.role,
  };

  for (let prop in object) if (!object[prop]) delete object[prop];

  User.find(object)
    .then((data) => {
      if (data.length > 0) res.send(data);
      res.send({ message: "No related users found" });
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving users.",
      });
    });
};

exports.findUserByIdSudo = async (req, res) => {
  const id = req.params.id;

  User.findById(id)
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: "User not found with id " + id,
        });
      }
      res.send(data);
    })
    .catch((err) => {
      if (err.kind === "ObjectId") {
        return res.status(404).send({
          message: "User not found with id " + id,
        });
      }
      res.status(500).send({
        message: "Error retrieving User with id " + id,
      });
    });
};

exports.updateSudo = async (req, res) => {
  const id = req.params.id;
  const pass = req.body.pass;
  const body = req.body;

  // hash password
  let hashedPassword = pass;
  if (pass) {
    try {
      const salt = await bcrypt.genSalt(11);
      hashedPassword = await bcrypt.hash(pass, salt);
    } catch (error) {
      res.status(500).send("server error");
    }
  }
  // Find user and update it with the request body
  User.findByIdAndUpdate(
    id,
    {
      fname: body.fname,
      lname: body.lname,
      email: body.email,
      pass: hashedPassword,
      role: body.role,
      phone: body.phone,
    },
    { new: true, omitUndefined: true }
  )
    .then((data) => {
      if (!data) {
        return res.status(404).send({
          message: "User not found with id " + id,
        });
      }
      res.send(data);
      // res.send({ id: data._id });
    })
    .catch((err) => {
      if (err.kind === "ObjectId") {
        return res.status(404).send({
          message: "User not found with id " + id,
        });
      }
      return res.status(500).send({
        message: "Error updating user with id " + id,
      });
    });
};

exports.deleteSudo = async (req, res) => {
  const id = req.params.id;

  User.findByIdAndRemove(id)
    .then((data) => {
      if (!data) {
        return res.status(404).send({
          message: "User not found with id " + id,
        });
      }
      res.send({ message: `User deleted successfully!` });
    })
    .catch((err) => {
      if (err.kind === "ObjectId" || err.name === "NotFound") {
        return res.status(404).send({
          message: "User not found with id " + id,
        });
      }
      return res.status(500).send({
        message: "Could not delete user with id " + id,
      });
    });
};

////////////////////////////////////////////////////////////////////////
// user routes
exports.find = (req, res) => {
  let object = {
    fname: req.body.fname,
    lname: req.body.lname,
    email: req.body.email,
  };

  for (let prop in object) if (!object[prop]) delete object[prop];

  User.find(object, "-pass -role -phone -_id")
    .then((data) => {
      if (data.length > 0) res.send(data);
      res.send({ message: "No related users found" });
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving users.",
      });
    });
};

exports.findUserById = async (req, res) => {
  const user_id = req.payload._id;

  if (!user_id) res.status(500).send({ message: "Server Error" });

  if (!user_id)
    res.status(401).send({ message: "user id to find is required" });

  // check if the user_id exists
  if (!isUser(user_id)) res.status(401).send({ message: "Invalid user id" });

  User.findById(user_id, "-pass")
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: "User not found with id " + id,
        });
      }
      res.send(data);
    })
    .catch((err) => {
      if (err.kind === "ObjectId") {
        return res.status(404).send({
          message: "User not found with id " + id,
        });
      }
      res.status(500).send({
        message: "Error retrieving User with id " + id,
      });
    });
};

exports.create = async (req, res) => {
  User.findOne({ email: req.body.email.trim() })
    .then((data) => {
      if (data) res.send({ error: "email already exists" });
    })
    .catch((err) => res.status(500).send("server error"));

  // Data Validations
  const { error } = registerValidations(req.body);
  if (error) return res.status(400).send(error);

  // Hash password
  const salt = await bcrypt.genSalt(11);
  const hashedPassword = await bcrypt.hash(req.body.pass, salt);

  // Create a user
  const user = new User({
    fname: req.body.fname,
    lname: req.body.lname,
    email: req.body.email.trim(),
    pass: hashedPassword,
    role: req.body.role,
    phone: req.body.phone,
  });

  // Save user in the database
  user
    .save()
    .then((data) => {
      res.send({ id: data._id });
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while creating the User.",
      });
    });
};

exports.update = async (req, res) => {
  const user_id = req.payload._id;
  const pass = req.body.pass;
  const body = req.body;

  if (!user_id) res.status(500).send({ message: "Server Error" });

  if (!user_id)
    res.status(401).send({ message: "user id to find is required" });

  // check if the user_id exists
  if (!isUser(user_id)) res.status(401).send({ message: "Invalid user id" });

  // hash password
  let hashedPassword = pass;
  if (pass) {
    try {
      const salt = await bcrypt.genSalt(11);
      hashedPassword = await bcrypt.hash(pass, salt);
    } catch (error) {
      res.status(500).send("server error");
    }
  }
  // Find user and update it with the request body
  User.findByIdAndUpdate(
    user_id,
    {
      fname: body.fname,
      lname: body.lname,
      email: body.email,
      pass: hashedPassword,
      role: body.role,
      phone: body.phone,
    },
    { new: true, omitUndefined: true }
  )
    .then((data) => {
      if (!data) {
        return res.status(404).send({
          message: "User not found with id " + id,
        });
      }
      res.send(data);
      // res.send({ id: data._id });
    })
    .catch((err) => {
      if (err.kind === "ObjectId") {
        return res.status(404).send({
          message: "User not found with id " + id,
        });
      }
      return res.status(500).send({
        message: "Error updating user with id " + id,
      });
    });
};

exports.delete = async (req, res) => {
  const id = req.params.id;
  const payload = req.payload;

  if (!payload) res.status(500).send({ message: "Server Error" });

  if (!id) res.status(401).send({ message: "user id to find is required" });

  // check if the user_id exists
  if (!isUser(id)) res.status(401).send({ message: "Invalid user id" });

  // authorization
  const authorized = await authorize(payload, id);
  if (!authorized) res.status(402).send({ message: "Access Denied" });

  User.findByIdAndRemove(id)
    .then((data) => {
      if (!data) {
        return res.status(404).send({
          message: "User not found with id " + id,
        });
      }
      res.send({ message: `User deleted successfully!` });
    })
    .catch((err) => {
      if (err.kind === "ObjectId" || err.name === "NotFound") {
        return res.status(404).send({
          message: "User not found with id " + id,
        });
      }
      return res.status(500).send({
        message: "Could not delete user with id " + id,
      });
    });
};
exports.staffrole = async (req, res) => {
  const user_id = req.payload._id;

  if (!user_id) res.status(500).send({ message: "Server Error" });

  if (!user_id)
    res.status(401).send({ message: "user id to find is required" });

  // check if the user_id exists
  if (!isUser(user_id)) res.status(401).send({ message: "Invalid user id" });

  var u = {};
  const user = await User.findById(user_id, "-pass");
  if (!user) {
    res.status(401).send({ message: "user is not found" });
  }
  if (user.role == "staff member") {
    const stf = await StaffMember.findOne({ usr_id: user_id });
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
