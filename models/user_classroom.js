const mongoose = require("mongoose");

const UserClassroomSchema = mongoose.Schema(
  {
    user_id: {
      type: String,
      required: true,
    },
    class_id: {
      type: String,
      required: true,
    },
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.model("users_classrooms", UserClassroomSchema);
