const mongoose = require("mongoose");

const ClassroomSchema = mongoose.Schema(
  {
    sub_id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.model("classrooms", ClassroomSchema);
