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
        trim: true,
      },

      college: {
        type: String,
        required: true,
        trim: true,
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
        min: 0,
      },

      paymentId: {
        type: String,
        default: "",
        trim: true,
      },

      orderId: {
        type: String,
        default: "",
        trim: true,
      },
    },
    {
      timestamps: true,
    }
  );

RegistrationSchema.index(
  { userId: 1, eventId: 1 },
  { unique: true }
);

module.exports =
  mongoose.model(
    "Registration",
    RegistrationSchema
  );
