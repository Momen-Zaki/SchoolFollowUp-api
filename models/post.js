const mongoose = require("mongoose");

const PostSchema = mongoose.Schema(
  {
    room_id: {
      type: String,
      required: [true, "room id is required"],
    },
    usr_name: {
      type: String,
      required: [true, "name is required"],
    },
    subject: {
      type: String,
      required: [true, "name is required"],
    },
    usr_id: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    createdat: {
      type: String,
      required: true,
    },
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.model("posts", PostSchema);
