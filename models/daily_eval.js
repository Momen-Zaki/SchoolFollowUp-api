const mongoose = require("mongoose");

const DailyEvalSchema = mongoose.Schema(
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
    subject: {
      type: String,
      required: true,
    },
    lessons: {
      type: String,
      required: true,
    },
    homework: {
      type: String,
      required: true,
    },
    question1: {
      type: String,
      required: true,
    },
    question2: {
      type: String,
      required: true,
    },
    question3: {
      type: String,
      required: true,
    },
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.model("dailyEvaluation", DailyEvalSchema);
