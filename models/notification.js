const mongoose = require("mongoose");

const NotificationSchema = mongoose.Schema(
  {
    user_id: {
      type: String,
      required: true,
    },
    post_id: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    createdat: {
      type: Number,
      required: true,
    },
    status: {
      type: Number,
      required: true,
    },
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.model("notifications", NotificationSchema);
