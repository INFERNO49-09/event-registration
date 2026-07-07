const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    venue: {
      type: String,
      required: true,
      trim: true,
    },

    date: {
      type: Date,
      required: true,
    },

    fee: {
      type: Number,
      default: 0,
      min: 0,
    },

    maxSeats: {
      type: Number,
      required: true,
      min: 1,
    },

    poster: {
      type: String,
      default: "",
      trim: true,
    },

    registrations: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Event", EventSchema);
