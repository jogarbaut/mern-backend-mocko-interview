const mongoose = require("mongoose")

const questionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    interview: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Interview"
    },
    body: {
      type: String,
      required: true,
    },
    toggled: {
      type: Boolean,
      default: true,
    },
    notes: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model("Question", questionSchema)