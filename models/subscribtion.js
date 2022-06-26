const mongoose = require("mongoose");

const SubscribtionSchema = mongoose.Schema(
  {
    owner_id: {
      type: String,
      required: true,
    },
    school_name: {
      type: String,
      required: true,
    },
    status: {
      type: Number,
      required: true,
    },
    startedat: {
      type: Number,
      required: true,
    },
    hours_used: {
      type: Number,
      required: true,
    },
    hour_cost: {
      type: Number,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    std_no: {
      type: Number,
      required: true,
    },
    stf_no: {
      type: Number,
      required: true,
    },
    admin_email: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.model("subscribtions", SubscribtionSchema);
