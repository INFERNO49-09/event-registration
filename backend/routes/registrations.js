const router = require("express").Router();
const mongoose = require("mongoose");
const Razorpay = require("razorpay");
const QRCode = require("qrcode");

const Registration = require("../models/Registration");
const Event = require("../models/Event");

const authMiddleware =
  require("../middleware/auth");
const { createTicketCode } = require("../utils/tickets");
const {
  sendCancellationEmail,
} = require("../utils/mailer");

const razorpay = new Razorpay({
  key_id:
    process.env.RAZORPAY_KEY_ID?.trim(),
  key_secret:
    process.env.RAZORPAY_KEY_SECRET?.trim(),
});

const isValidObjectId = (id) =>
  mongoose.Types.ObjectId.isValid(id);

const cleanText = (value) =>
  typeof value === "string" ? value.trim() : "";

async function ensureTicketCode(registration) {
  if (registration.ticketCode) {
    return registration.ticketCode;
  }

  registration.ticketCode = createTicketCode();
  await registration.save();
  return registration.ticketCode;
}

/*
Register For Event
*/

router.post(
  "/",
  authMiddleware,
  async (req, res) => {
    try {
      const userId = req.user._id;

      const {
        eventId,
        phone,
        college,
      } = req.body;

      if (
        !isValidObjectId(eventId) ||
        !cleanText(phone) ||
        !cleanText(college)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Please fill all required fields",
        });
      }

      const event =
        await Event.findById(eventId);

      if (!event) {
        return res.status(404).json({
          success: false,
          message: "Event not found",
        });
      }

      const existing =
        await Registration.findOne({
          userId,
          eventId,
        });

      if (existing) {
        return res.status(400).json({
          success: false,
          message:
            "Already registered for this event",
        });
      }

      if (
        event.registrations >=
        event.maxSeats
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Event is fully booked",
        });
      }

      const registration =
        await Registration.create({
          userId,
          eventId,
          phone: cleanText(phone),
          college: cleanText(college),
          paymentStatus: "pending",
          amountPaid: 0,
          ticketCode: createTicketCode(),
        });

      await Event.findByIdAndUpdate(
        eventId,
        {
          $inc: {
            registrations: 1,
          },
        }
      );

      res.status(201).json({
        success: true,
        registration,
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message:
            "Already registered for this event",
        });
      }

      res.status(500).json({
        success: false,
        message: "Registration failed",
      });
    }
  }
);

/*
Ticket QR Code
*/

router.get(
  "/:id/qr",
  authMiddleware,
  async (req, res) => {
    try {
      if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid registration ID",
        });
      }

      const registration =
        await Registration.findById(
          req.params.id
        );

      if (!registration) {
        return res.status(404).json({
          success: false,
          message:
            "Registration not found",
        });
      }

      const isOwner =
        registration.userId.toString() ===
        req.user._id.toString();
      const isAdmin =
        req.user.role === "admin";

      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      const ticketCode =
        await ensureTicketCode(registration);
      const svg = await QRCode.toString(
        ticketCode,
        {
          type: "svg",
          margin: 1,
          width: 240,
        }
      );

      res.type("image/svg+xml");
      return res.send(svg);
    } catch (error) {
      console.error("QR generation failed:", error);
      return res.status(500).json({
        success: false,
        message: "QR code generation failed",
      });
    }
  }
);

/*
Get Registrations For Event
*/

router.get(
  "/event/:eventId",
  authMiddleware,
  async (req, res) => {
    try {
      if (!isValidObjectId(req.params.eventId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid event ID",
        });
      }

      const registrations =
        await Registration.find({
          eventId: req.params.eventId,
        })
          .populate(
            "userId",
            "name email"
          )
          .populate(
            "eventId",
            "title venue date"
          );

      res.json(registrations);
    } catch (error) {
      console.error("Event registrations lookup failed:", error);
      res.status(500).json({
        success: false,
        message: "Failed to load event registrations",
      });
    }
  }
);

/*
Get Current User Registrations
*/

router.get(
  "/user/:userId",
  authMiddleware,
  async (req, res) => {
    try {
      if (!isValidObjectId(req.params.userId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid user ID",
        });
      }

      // Users can only view their own registrations
      if (
        req.user._id.toString() !==
          req.params.userId &&
        req.user.role !== "admin"
      ) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      const registrations =
        await Registration.find({
          userId: req.params.userId,
        }).populate("eventId");

      res.json(registrations);
    } catch (error) {
      console.error("User registrations lookup failed:", error);
      res.status(500).json({
        success: false,
        message: "Failed to load registrations",
      });
    }
  }
);

/*
Cancel Registration
*/

router.delete(
  "/:id",
  authMiddleware,
  async (req, res) => {
    try {
      if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid registration ID",
        });
      }

      const registration =
        await Registration.findById(
          req.params.id
        );

      if (!registration) {
        return res.status(404).json({
          success: false,
          message:
            "Registration not found",
        });
      }

      const isOwner =
        registration.userId.toString() ===
        req.user._id.toString();

      const isAdmin =
        req.user.role === "admin";

      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      if (registration.status === "cancelled") {
        return res.status(409).json({
          success: false,
          message:
            "Registration is already cancelled",
        });
      }

      const event = await Event.findById(
        registration.eventId
      );

      let refundStatus = "none";
      let refundId = "";

      if (
        registration.paymentStatus ===
          "paid" &&
        registration.paymentId &&
        registration.amountPaid > 0
      ) {
        try {
          const refund =
            await razorpay.payments.refund(
              registration.paymentId,
              {
                amount: Math.round(
                  registration.amountPaid * 100
                ),
                notes: {
                  registrationId:
                    registration._id.toString(),
                  eventId:
                    registration.eventId.toString(),
                },
              }
            );

          refundStatus = "processed";
          refundId = refund.id;
        } catch (error) {
          console.error(
            "Refund creation failed:",
            error
          );
          refundStatus = "failed";
        }
      }

      const shouldReleaseSeat =
        registration.status ===
        "registered";

      registration.status = "cancelled";
      registration.paymentStatus =
        refundStatus === "processed"
          ? "refunded"
          : registration.paymentStatus;
      registration.refundStatus = refundStatus;
      registration.refundId = refundId;
      registration.cancelledAt = new Date();
      registration.cancellationReason = cleanText(
        req.body?.reason
      );

      await registration.save();

      if (shouldReleaseSeat) {
        await Event.findOneAndUpdate(
          {
            _id: registration.eventId,
            registrations: { $gt: 0 },
          },
          { $inc: { registrations: -1 } }
        );
      }

      sendCancellationEmail({
        user: req.user,
        event,
        registration,
      }).catch((error) => {
        console.error(
          "Cancellation email failed:",
          error
        );
      });

      res.json({
        success: true,
        message:
          refundStatus === "failed"
            ? "Registration cancelled, but refund creation failed"
            : "Registration cancelled successfully",
        registration,
      });
    } catch (error) {
      console.error("Registration cancellation failed:", error);
      res.status(500).json({
        success: false,
        message: "Registration cancellation failed",
      });
    }
  }
);

module.exports = router;
