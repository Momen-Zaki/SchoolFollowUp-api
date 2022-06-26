const mongoose = require("mongoose");

const CommentSchema = mongoose.Schema(
  {
    post_id: {
      type: String,
      required: true,
    },
    usr_name: {
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

module.exports = mongoose.model("comments", CommentSchema);
