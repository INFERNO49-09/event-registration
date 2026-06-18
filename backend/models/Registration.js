const mongoose = require("mongoose");

const RegistrationSchema =
  new mongoose.Schema(
    {
      userId: {
        type:
          mongoose.Schema.Types
            .ObjectId,
        ref: "User",
        required: true,
      },

      eventId: {
        type:
          mongoose.Schema.Types
            .ObjectId,
        ref: "Event",
        required: true,
      },

      phone: {
        type: String,
        required: true,
      },

      college: {
        type: String,
        required: true,
      },

      paymentStatus: {
        type: String,
        enum: [
          "pending",
          "paid",
        ],
        default: "pending",
      },

      amountPaid: {
        type: Number,
        default: 0,
      },

      paymentId: {
        type: String,
        default: "",
      },

      orderId: {
        type: String,
        default: "",
      },
    },
    {
      timestamps: true,
    }
  );

module.exports =
  mongoose.model(
    "Registration",
    RegistrationSchema
  );