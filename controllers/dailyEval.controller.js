const Daily = require("../models/daily_eval");
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

  const eval = new Daily({
    std_id: req.params.id,
    teacher_id: user_id,
    parent_id: Std.parent_id,
    std_name: Std.name,
    teacher_name: user.fname + " " + user.lname,
    notes: body.notes,
    subject: body.subject,
    question1: body.question1,
    question2: body.question2,
    question3: body.question3,
    homework: body.homework,
    lessons: body.lessons,
    createdat: Date.now(),
  });

  eval
    .save()
    .then((data) => {})
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while saving the evaluation.",
      });
    });
  const a = [];
  a.push(Std.parent_id);
  notify("daily report ", eval._id, a, "d");
  res.send("done");
};
exports.find = async (req, res) => {
  user_id = req.payload._id;
  id = req.params.id;
  const user = await User.findOne({ _id: user_id });
  if (!user) {
    res.status(400).send({ message: "user not found" });
  }

  const eva = await Daily.find({ std_id: id });
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
  const eva = await Daily.findOne({ _id: id });
  if (!eva) {
    res.status(400).send({ message: "can not find evaluation" });
  }
  res.send(eva);
};
