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
          "refunded",
          "failed",
        ],
        default: "pending",
      },

      status: {
        type: String,
        enum: [
          "registered",
          "waitlisted",
          "cancelled",
        ],
        default: "registered",
      },

      ticketCode: {
        type: String,
        trim: true,
      },

      waitlistPosition: {
        type: Number,
        default: null,
      },

      checkedIn: {
        type: Boolean,
        default: false,
      },

      checkedInAt: {
        type: Date,
        default: null,
      },

      checkedInBy: {
        type:
          mongoose.Schema.Types
            .ObjectId,
        ref: "User",
        default: null,
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

      refundId: {
        type: String,
        default: "",
        trim: true,
      },

      refundStatus: {
        type: String,
        enum: [
          "none",
          "requested",
          "processed",
          "failed",
        ],
        default: "none",
      },

      cancelledAt: {
        type: Date,
        default: null,
      },

      cancellationReason: {
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

RegistrationSchema.index(
  { ticketCode: 1 },
  { unique: true, sparse: true }
);
RegistrationSchema.index({ eventId: 1, status: 1, createdAt: 1 });

module.exports =
  mongoose.model(
    "Registration",
    RegistrationSchema
  );
