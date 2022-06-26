const mongoose = require("mongoose");

const StaffSchema = mongoose.Schema(
  {
    usr_id: {
      type: String,
      required: true,
      unique: true,
    },
    sub_id: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.model("staff_members", StaffSchema);
