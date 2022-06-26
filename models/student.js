const mongoose = require("mongoose");

const StudentSchema = mongoose.Schema(
  {
    parent_id: {
      type: String,
      required: true,
    },
    sub_id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    result: {
      type: String,
      required: true,
    },
    grade: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      required: true,
    },
    ssn: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.model("students", StudentSchema);
