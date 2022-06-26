const mongoose = require("mongoose");

const WeeklyEvalSchema = mongoose.Schema(
  {
    std_id: {
      type: String,
      required: true,
    },
    teacher_id: {
      type: String,
      required: true,
    },
    parent_id: {
      type: String,
      required: true,
    },
    std_name: {
      type: String,
      required: true,
    },
    teacher_name: {
      type: String,
      required: true,
    },
    createdat: {
      type: Number,
      required: true,
    },
    notes: {
      type: String,
      required: true,
    },

    q1: {
      type: String,
      required: true,
    },
    q2: {
      type: String,
      required: true,
    },
    q3: {
      type: String,
      required: true,
    },
    q4: {
      type: String,
      required: true,
    },
    q5: {
      type: String,
      required: true,
    },
    q6: {
      type: String,
      required: true,
    },
    q7: {
      type: String,
      required: true,
    },
    q8: {
      type: String,
      required: true,
    },
    q9: {
      type: String,
      required: true,
    },
    q10: {
      type: String,
      required: true,
    },
    q11: {
      type: String,
      required: true,
    },
    q12: {
      type: String,
      required: true,
    },
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.model("weeklyEvaluation", WeeklyEvalSchema);
