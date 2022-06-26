const Subscribtion = require("../models/subscribtion");
const User = require("../models/user");
const StaffMember = require("../models/staff_member");
const Student = require("../models/student");
const Classrooms = require("../models/classroom");
const bcrypt = require("bcryptjs");
const {
  SubAdminValidations,
  isOwnerofSub,
  isSubscriber,
} = require("../validations/validation");
const _active = 1;
const _disabled = 0;
const _admin = "admin";
const _staff_member = "staff member";
const _none = "None";
const _std_cost = 0.1;
const _stf_cost = 0.3;
const _activee = "active";
exports.findSudo = (req, res) => {
  const body = req.body;

  let object = {
    owner_id: body.owner_id,
    school_name: body.school_name,
    status: body.status,
    startedat: parseFloat(body.startedat),
    hours_used: parseFloat(body.hours_used),
    hour_cost: parseFloat(body.hour_cost),
    address: body.address,
    std_no: body.std_no,
    stf_no: body.stf_no,
  };

  for (let prop in object) if (!object[prop]) delete object[prop];

  Subscribtion.find(object)
    .then((data) => {
      if (data.length > 0) res.send(data);
      res.send({ message: "No subscribtions found" });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving subscribtions.",
      });
    });
}; // done

exports.findByIdSudo = (req, res) => {
  const id = req.params.id;

  if (!id) res.status(401).send("subscribtion id is required");

  Subscribtion.findById(id)
    .then((sub) => {
      if (!sub) {
        return res.status(404).send({
          message: "subscribtion not found with id " + id,
        });
      }
      const hours_used_ceiled = Math.ceil(sub.hours_used);
      sub.hours_used = hours_used_ceiled;
      res.send(sub);
    })
    .catch((err) => {
      if (err.kind === "ObjectId") {
        return res.status(404).send({
          message: "subscribtion not found with id " + id,
        });
      }
      return res.status(500).send({
        message: "Error retrieving subscribtion with id " + id,
      });
    });
}; // done

// takes: owner_id, shcool_name, address,
//staff_no, std_no, admin_email, admin_pass
exports.createSudo = async (req, res) => {
  const body = req.body;
  if (
    !body.owner_id ||
    !body.school_name ||
    !body.address ||
    !body.stf_no ||
    !body.std_no ||
    !body.admin_email ||
    !body.admin_pass
  )
    res.status(401).send(
      `[userID, school name, address,
        staff no, students no, admin email,
        admin password] are required`
    );
  // check if email exists
  User.findOne({ email: body.admin_email.trim() })
    .then((data) => {
      if (data) res.send({ error: "email already exists" });
    })
    .catch((err) => res.status(500).send("server error"));

  const hour_cost =
    parseInt(body.std_no) * _std_cost + parseInt(body.stf_no) * _stf_cost;

  // Create a subscribtion
  let sub = new Subscribtion({
    owner_id: body.owner_id,
    school_name: body.school_name,
    status: _disabled,
    startedat: Date.now(),
    hours_used: 0,
    hour_cost: hour_cost,
    address: body.address,
    std_no: parseInt(body.std_no),
    stf_no: parseInt(body.stf_no),
  });

  // ADMIN CREATION
  // Data Validations
  const { error } = SubAdminValidations({
    email: body.admin_email,
    pass: body.admin_pass,
  });
  if (error) return res.status(400).send(error);

  // Hash password
  const salt = await bcrypt.genSalt(11);
  const hashedPassword = await bcrypt.hash(body.admin_pass, salt);

  // Create a user
  let user = new User({
    fname: _none,
    lname: _none,
    email: body.admin_email.trim(),
    pass: hashedPassword,
    role: _staff_member,
    phone: _none,
  });

  let stf = new StaffMember({
    usr_id: user._id,
    sub_id: sub._id,
    status: _suspended,
    role: _admin,
  });

  await sub
    .save()
    .catch((err) =>
      res.status(500).send({ message: `couldn't create subscribtion` })
    );

  await user
    .save()
    .catch((err) => res.status(500).send({ message: `couldn't create user` }));

  await stf
    .save()
    .catch((err) =>
      res.status(500).send({ message: `couldn't create staff member` })
    );

  res.send({ sub: sub, admn: user, stf: stf });
}; // done

// takes: optional [owner_id, school_name, status, startedat, hours_used,
// hour_cost, address, std_no, stf_no, admin_email, admin_pass, admin_status]
exports.updateSudo = async (req, res) => {
  const id = req.params.id;
  const body = req.body;
  let result = {};

  // update sub info
  await Subscribtion.findByIdAndUpdate(
    id,
    {
      owner_id: body.owner_id,
      school_name: body.school_name,
      hours_used: body.hours_used,
      hour_cost: body.hour_cost,
      address: body.address,
      std_no: body.std_no,
      stf_no: body.stf_no,
    },
    { new: true, omitUndefined: true }
  )
    .then((sub) => {
      if (!sub) {
        return res.status(404).send({
          message: "subscribtion not found with id " + id,
        });
      }
      const hours_used_ceiled = Math.ceil(parseFloat(sub.hours_used));
      sub.hours_used = hours_used_ceiled;
      result.sub = sub;
    })
    .catch((err) => {
      if (err.kind === "ObjectId") {
        res.status(404).send({
          message: "subscribtion not found with id " + id,
        });
      }
      res.status(500).send({
        message: "Error updating subsctibtion with id " + id,
      });
    });

  // UPDATE ADMIN INOF
  // find user_id
  const stf = await StaffMember.findOne({
    sub_id: id,
    role: _admin,
  }).catch((err) => res.status(500).send({ message: "Error retrieving stf" }));

  // update user
  await User.findByIdAndUpdate(
    stf.usr_id,
    {
      email: body.admin_email,
      pass: body.admin_pass,
    },
    { new: true, omitUndefined: true }
  )
    .then((user) => {
      if (!user) {
        return res.status(404).send({
          message: "user not found with id " + stf.usr_id,
        });
      }
      result.stf = stf;
      result.user = user;

      res.send(result);
    })
    .catch((err) => {
      if (err.kind === "ObjectId") {
        return res.status(404).send({
          message: "user not found with id " + stf.usr_id,
        });
      }
      return res.status(500).send({
        message: "Error updating user with id " + stf.usr_id,
      });
    });
}; // done

exports.pauseSudo = async (req, res) => {
  const id = req.params.id;
  if (!id) res.status(401).send({ message: "subscritbtion id is required." });

  // pause subscribtion
  const sub = await Subscribtion.findById(id).catch((err) => {
    res.status(400).send({ messege: "subscribtion not found" });
  });

  if (sub.status == _disabled)
    res.status(401).send({ message: "this subscribtion already paused" });

  const now = Date.now();
  const newHoursUsed = (now - sub.startedat) / (60 * 60 * 1000);

  sub.startedat = now;
  sub.hours_used = sub.hours_used + newHoursUsed;
  sub.status = _disabled;

  sub
    .save()
    .then((data) => {
      const hours_used_ceiled = Math.ceil(sub.hours_used);
      sub.hours_used = hours_used_ceiled;
      res.send(data);
    })
    .catch((err) => res.status(500).send("Server Error"));
}; // done

exports.activeSudo = async (req, res) => {
  const id = req.params.id;

  if (!id) res.status(401).send({ err: "subscritbtion id is required." });

  // active subscribtion
  const sub = await Subscribtion.findById(id).catch((err) => {
    res.status(400).send({ err: "subscribtion not found" });
  });

  if (sub.status == _active)
    res.status(401).send("this subscribtion already active");

  sub.status = _active;

  sub
    .save()
    .then((data) => {
      const hours_used_ceiled = Math.ceil(sub.hours_used);
      sub.hours_used = hours_used_ceiled;
      res.send(data);
    })
    .catch((err) => res.status(500).send(`${error}`));
}; // done

exports.deleteSudo = async (req, res) => {
  const id = req.params.id;

  if (!id) res.status(401).send("subscribtion id is required");

  // find and delete sub
  await Subscribtion.findOneAndDelete({ _id: id }).catch((err) =>
    res.status(400).send({ message: "Error finding sub" })
  );

  // find stfs
  const users_ids = await StaffMember.find(
    { sub_id: id },
    "usr_id"
  ).catch((err) => res.status(400).send({ message: "Error finding stfs" }));

  let ids_list = [];
  for (let i in users_ids) ids_list.push(users_ids[i].usr_id);

  // find and delete stf users
  await User.deleteMany({ _id: { $in: ids_list } }).catch((err) =>
    res.status(400).send({ message: "Error finding users" })
  );

  // find and delete stfs
  await StaffMember.deleteMany({ sub_id: id }).catch((err) =>
    res.status(400).send({ message: "Error finding users" })
  );
  await Classrooms.deleteMany({ sub_id: id }).catch((err) =>
    res.status(400).send({ message: "Error finding users" })
  );
  //
  await Student.deleteMany({ sub_id: id }).catch((err) =>
    res.status(400).send({ message: "Error finding users" })
  );

  res.send({
    message: `subsscribtion with staff members are deleted successfuly`,
  });
}; //done

////////////////////////////////////////////////////////////////////////
// subscriber routes
exports.find = async (req, res) => {
  const user_id = req.payload._id;
  const body = req.body;

  const user = await User.findById(user_id);
  if (user.role != "subscriber") {
    res.status(400).send({ message: "Access denied" });
  }
  await Subscribtion.find({ owner_id: user_id })
    .then((data) => {
      if (data.length > 0) res.send(data);
      res.send({ message: "No subscribtions found" });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving subscribtions.",
      });
    });
}; // done

exports.findById = async (req, res) => {
  const id = req.params.id;
  const user_id = req.payload._id;

  if (!id) res.status(401).send("subscribtion id is required");

  // check if user is the owner of the subscribtion
  const owner = await isOwnerofSub(user_id, id);
  if (!owner) res.status(403).send({ message: "Access Denied" });

  // find subscribtion
  Subscribtion.findById(id)
    .then((data) => {
      if (!data) {
        return res.status(404).send({
          message: "subscribtion not found with id " + id,
        });
      }
      const hours_used = Math.ceil(data.hours_used);
      data.hours_used = hours_used;
      res.send(data);
    })
    .catch((err) => {
      if (err.kind === "ObjectId") {
        return res.status(404).send({
          message: "subscribtion not found with id " + id,
        });
      }
      return res.status(500).send({
        message: "Error retrieving subscribtion with id " + id,
      });
    });
}; // done

// takes shcool_name, address,
// staff_no, std_no, admin_email, admin_pass
exports.create = async (req, res) => {
  const owner_id = req.payload._id;

  const body = req.body;

  if (
    !owner_id ||
    !body.school_name ||
    !body.address ||
    !body.stf_no ||
    !body.std_no ||
    !body.admin_email ||
    !body.admin_pass
  )
    res.status(401).send(
      `[school name, address,
        staff no, students no, admin email,
        admin password] are required`
    );

  const subscriber = await isSubscriber(owner_id);

  if (!subscriber) res.status(403).send({ message: "Access Denied" });
  else {
    // check if email exists
    User.findOne({ email: body.admin_email.trim() })
      .then((data) => {
        if (data) res.send({ error: "email already exists" });
      })
      .catch((err) => res.status(500).send("server error"));

    const hour_cost = body.std_no * _std_cost + body.stf_no * _stf_cost;

    // Create a subscribtion
    let sub = new Subscribtion({
      owner_id: owner_id,
      school_name: body.school_name,
      status: _disabled,
      startedat: Date.now(),
      hours_used: 0,
      hour_cost: hour_cost,
      address: body.address,
      std_no: body.std_no,
      stf_no: body.stf_no,
      admin_email: body.admin_email,
    });

    // ADMIN CREATION
    // Data Validations
    const { error } = SubAdminValidations({
      email: body.admin_email,
      pass: body.admin_pass,
    });
    if (error) return res.status(400).send(error);

    // Hash password
    const salt = await bcrypt.genSalt(11);
    const hashedPassword = await bcrypt.hash(body.admin_pass, salt);

    // Create a user
    let user = new User({
      fname: _none,
      lname: _none,
      email: body.admin_email.trim(),
      pass: hashedPassword,
      role: _staff_member,
      phone: _none,
    });

    let stf = new StaffMember({
      usr_id: user._id,
      sub_id: sub._id,
      status: _activee,
      role: _admin,
    });

    stf
      .save()
      .catch((err) =>
        res.status(500).send({ message: `couldn't create staff member` })
      );

    sub
      .save()
      .catch((err) =>
        res.status(500).send({ message: `couldn't create subscribtion` })
      );

    user
      .save()
      .catch((err) =>
        res.status(500).send({ message: `couldn't create user` })
      );

    res.send({ sub: sub, admin: user, stf: stf });
  }
}; // done

// takes optional[school_name, address, std_no, stf_no, admin_email, admin_pass]
exports.update = async (req, res) => {
  const id = req.params.id;
  const user_id = req.payload._id;
  const body = req.body;
  let result = {};

  if (!id) res.status(401).send({ message: "subscribtion id is required" });

  // check if user is the owner of the subscribtion
  const owner = await isOwnerofSub(user_id, id);
  if (!owner) res.status(403).send({ message: "Access Denied" });

  // update sub info
  await Subscribtion.findByIdAndUpdate(
    id,
    {
      school_name: body.school_name,
      address: body.address,
      std_no: body.std_no,
      stf_no: body.stf_no,
      admin_email: body.admin_email,
    },
    { new: true, omitUndefined: true }
  )
    .then((sub) => {
      if (!sub) {
        res.status(404).send({
          message: "subscribtion not found with id " + id,
        });
      }
      const hours_used_ceiled = Math.ceil(parseFloat(sub.hours_used));
      sub.hours_used = hours_used_ceiled;
      result.sub = sub;
    })
    .catch((err) => {
      if (err.kind === "ObjectId") {
        res.status(404).send({
          message: "subscribtion not found with id " + id,
        });
      }
      res.status(500).send({
        message: "Error updating subsctibtion with id " + id,
      });
    });

  // UPDATE ADMIN INOF
  // find user_id
  const stf = await StaffMember.findOne({
    sub_id: id,
    role: _admin,
  }).catch((err) => res.status(500).send({ message: "Error retrieving stf" }));

  // update user
  await User.findByIdAndUpdate(
    stf.usr_id,
    {
      email: body.admin_email,
      pass: body.admin_pass,
    },
    { new: true, omitUndefined: true }
  )
    .then((user) => {
      if (!user) {
        return res.status(404).send({
          message: "user not found with id " + stf.usr_id,
        });
      }
      result.stf = stf;
      result.user = user;

      res.send(result);
    })
    .catch((err) => {
      if (err.kind === "ObjectId") {
        return res.status(404).send({
          message: "user not found with id " + stf.usr_id,
        });
      }
      return res.status(500).send({
        message: "Error updating user with id " + stf.usr_id,
      });
    });
}; // done

exports.delete = async (req, res) => {
  const id = req.params.id;
  const user_id = req.payload._id;

  if (!id) res.status(401).send({ message: "subscritbtion id is required." });

  // check if user is the owner of the subscribtion
  const owner = await isOwnerofSub(user_id, id);
  if (!owner) res.status(403).send({ message: "Access Denied" });

  if (!id) res.status(401).send("subscribtion id is required");

  // find and delete sub
  await Subscribtion.findOneAndDelete({ _id: id }).catch((err) =>
    res.status(400).send({ message: "Error finding sub" })
  );

  // find stfs
  const users_ids = await StaffMember.find(
    { sub_id: id },
    "usr_id"
  ).catch((err) => res.status(400).send({ message: "Error finding stfs" }));

  let ids_list = [];
  for (let i in users_ids) ids_list.push(users_ids[i].usr_id);

  // find and delete stf users
  await User.deleteMany({ _id: { $in: ids_list } }).catch((err) =>
    res.status(400).send({ message: "Error finding users" })
  );

  // find and delete stfs
  await StaffMember.deleteMany({ sub_id: id }).catch((err) =>
    res.status(400).send({ message: "Error finding users" })
  );

  // DELETE CLASSROOMS
  await Classrooms.deleteMany({ sub_id: id }).catch((err) =>
    res.status(400).send({ message: "Error finding users" })
  );
  //
  await Student.deleteMany({ sub_id: id }).catch((err) =>
    res.status(400).send({ message: "Error finding users" })
  );

  res.send({
    message: `subsscribtion with staff members are deleted successfuly`,
  });
}; // UNdone

exports.getCost = (req, res) => {
  let stf_no = 0;
  let std_no = 0;
  try {
    stf_no = parseInt(req.body.stf_no);
    std_no = parseInt(req.body.std_no);
  } catch (err) {
    res.status(401).send({ message: "invalid numbers" });
  }

  if (!std_no || !stf_no) {
    res.status(401).send({
      message: "students number and staff members number are required.",
    });
  }

  const total = std_no * _std_cost + stf_no * _stf_cost;
  res.send({ total_cost: total });
}; // done

exports.pause = async (req, res) => {
  const id = req.params.id;
  const user_id = req.payload._id;

  if (!id) res.status(401).send({ message: "subscritbtion id is required." });

  // check if user is the owner of the subscribtion
  const owner = await isOwnerofSub(user_id, id);
  if (!owner) res.status(403).send({ message: "Access Denied" });

  // pause subscribtion
  const sub = await Subscribtion.findById(id).catch((err) => {
    res.status(400).send({ messege: "subscribtion not found" });
  });

  if (sub.status == _disabled)
    res.status(401).send({ message: "this subscribtion already paused" });

  const now = Date.now();
  const newHoursUsed = (now - sub.startedat) / (60 * 60 * 1000);

  sub.startedat = now;
  sub.hours_used = sub.hours_used + newHoursUsed;
  sub.status = _disabled;

  sub
    .save()
    .then((data) => {
      const hours_used_ceiled = Math.ceil(sub.hours_used);
      sub.hours_used = hours_used_ceiled;
      res.send(data);
    })
    .catch((err) => res.status(500).send("Server Error"));
}; // done

exports.active = async (req, res) => {
  const id = req.params.id;
  const user_id = req.payload._id;

  if (!id) res.status(401).send({ err: "subscritbtion id is required." });

  // check if user is the owner of the subscribtion
  const owner = await isOwnerofSub(user_id, id);
  if (!owner) res.status(403).send({ message: "Access Denied" });

  // active subscribtion
  const sub = await Subscribtion.findById(id).catch((err) => {
    res.status(400).send({ err: "subscribtion not found" });
  });

  if (sub.status == _active)
    res.status(401).send("this subscribtion already active");

  sub.status = _active;

  sub
    .save()
    .then((data) => {
      const hours_used_ceiled = Math.ceil(sub.hours_used);
      sub.hours_used = hours_used_ceiled;
      res.send(data);
    })
    .catch((err) => res.status(500).send(`${error}`));
}; // done

exports.costed = async (req, res) => {
  const user_id = req.payload._id;

  const user = await User.findById(user_id);
  if (user.role != "subscriber") {
    res.status(400).send({ message: "access denies" });
  }

  const a = { std_cost: _std_cost, stf_cost: _stf_cost };
  res.send(a);
};
