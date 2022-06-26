const Weekly = require("../models/weekly_eval");
const Student = require("../models/student");
const User = require("../models/user");
const StaffMember = require("../models/staff_member");
const { notify } = require("./notification.controller");
const notification = require("../models/notification");

exports.create = async (req, res) => {
  user_id = req.payload._id;
  const body = req.body;

  const stf = await StaffMember.findOne({ usr_id: user_id });
  if (!stf) {
    res.status(400).send({ message: "staffmember not found" });
  }
  if (stf.role != "teacher" && stf.role != "supteacher") {
    res.status(400).send({ message: "Access denied" });
  }

  const Std = await Student.findOne({ _id: req.params.id });
  if (!Std) {
    res.status(400).send({ message: "student not found" });
  }

  const user = await User.findOne({ _id: user_id });
  if (!Std) {
    res.status(400).send({ message: "user not found" });
  }

  const eval = new Weekly({
    std_id: req.params.id,
    teacher_id: user_id,
    parent_id: Std.parent_id,
    std_name: Std.name,
    teacher_name: user.fname + " " + user.lname,
    notes: body.notes,
    q1: body.q1,
    q2: body.q2,
    q3: body.q3,
    q4: body.q4,
    q5: body.q5,
    q6: body.q6,
    q7: body.q7,
    q8: body.q8,
    q9: body.q9,
    q10: body.q10,
    q11: body.q11,
    q12: body.q12,

    createdat: Date.now(),
  });

  eval.save().catch((err) => {
    res.status(500).send({
      message:
        err.message || "Some error occurred while saving the evaluation.",
    });
  });
  const a = [];
  a.push(Std.parent_id);
  notify("weekly report ", eval._id, a, "w");
  res.send("done");
};
exports.find = async (req, res) => {
  user_id = req.payload._id;
  id = req.params.id;
  const user = await User.findOne({ _id: user_id });
  if (!user) {
    res.status(400).send({ message: "user not found" });
  }

  const eva = await Weekly.find({ std_id: id });
  if (!eva) {
    res.status(400).send({ message: "can not find evaluation" });
  }
  res.send(eva);
};
exports.findByID = async (req, res) => {
  user_id = req.payload._id;
  id = req.params.id;
  const user = await User.findOne({ _id: user_id });
  if (!user) {
    res.status(400).send({ message: "user not found" });
  }
  if (user.role != "parent") {
    res.status(400).send({ message: "Access denied" });
  }
  const eva = await Weekly.findOne({ _id: id });
  if (!eva) {
    res.status(400).send({ message: "can not find evaluation" });
  }
  res.send(eva);
};
