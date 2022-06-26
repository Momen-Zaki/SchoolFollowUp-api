const Joi = require("@hapi/joi");
// const CustomJoi = Joi.extend(require("joi-phone-number"));

module.exports.registerValidations = (data) => {
  const schema = Joi.object({
    fname: Joi.string().min(3).max(255).required(),
    lname: Joi.string().min(3).max(255).required(),
    role: Joi.string().min(5).max(30).required(),
    phone: Joi.string().min(3).max(20).required(),
    email: Joi.string().min(6).email().required(),
    pass: Joi.string().min(6).required(),
  });

  return schema.validate(data);
};

module.exports.SubAdminValidations = (data) => {
  const schema = Joi.object({
    email: Joi.string().min(6).email().required(),
    pass: Joi.string().min(6).required(),
  });

  return schema.validate(data);
};
module.exports.staffVal = (data) => {
  const schema = Joi.object({
    role: Joi.string().min(1).max(30).required(),
    email: Joi.string().min(6).email().required(),
    pass: Joi.string().min(6).required(),
  });

  return schema.validate(data);
};
module.exports.stdval = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(30).required(),
    gender: Joi.string().min(1).required(),
    grade: Joi.string().min(1).required(),
    ssn: Joi.number().required(),
  });

  return schema.validate(data);
};
const Student = require("../models/student");
const User = require("..//models/user");
const StaffMember = require("../models/staff_member");
const Subsctibtion = require("../models/subscribtion");
const _subscriber = "subscriber";

exports.authorize = async (payload, id) => {
  try {
    const user = await User.findOne({ _id: id });
    const result = user._id == payload._id;
    return result;
  } catch (error) {
    return false;
  }
};

exports.isUser = async (id) => {
  try {
    const user = await User.findOne({ _id: id });

    if (!user) return false;

    return true;
  } catch (error) {
    return false;
  }
};

exports.isStaffMember = async (id) => {
  try {
    const stf = await StaffMember.findOne({ usr_id: id });

    if (!stf || stf.role == "admin") return false;
    return true;
  } catch (error) {
    return false;
  }
};

exports.isAdmin = async (id) => {
  try {
    const stf = await StaffMember.findOne({ usr_id: id });

    if (!stf || stf.role != "admin") return false;
    return true;
  } catch (error) {
    return false;
  }
};

exports.isAdminOfSub = async (user_id, sub_id) => {
  try {
    const admin = await StaffMember.findOne({ usr_id: user_id });

    if (!admin || admin.role != "admin") return false;

    return admin.sub_id == sub_id;
  } catch (error) {
    return false;
  }
};

exports.isMemberOfSub = async (user_id, sub_id) => {
  try {
    const stf = await StaffMember.findOne({ usr_id: user_id });

    if (!stf || stf.role == "admin") return false;

    return stf.sub_id == sub_id;
  } catch (error) {
    return false;
  }
};

exports.isMemberOfAdminsSub = async (stf_id, admin_id) => {
  try {
    const stf = await StaffMember.findOne({ usr_id: stf_id });
    const admin = await StaffMember.findOne({ usr_id: admin_id });

    if (!stf || stf.role == "admin" || !admin || admin.role != "admin") {
      return false;
    }
    if (stf.sub_id == admin.sub_id) {
      return true;
    }
  } catch (error) {
    return false;
  }
};

exports.isOwnerofSub = async (user_id, sub_id) => {
  try {
    const sub = await Subsctibtion.findOne({ _id: sub_id });

    const result = user_id == sub.owner_id;
    return result;
  } catch (error) {
    return false;
  }
};

exports.isSubscriber = async (user_id) => {
  try {
    const user = await User.findOne({ _id: user_id });

    const result = user.role == _subscriber;
    return result;
  } catch (error) {
    return false;
  }
};
exports.isAdminofStudent = async (student_id, admin_id) => {
  try {
    const user = await StaffMember.findOne({ usr_id: admin_id });
    const std = await Student.findOne({ _id: student_id });
    if (std.sub_id == user.sub_id) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
};
