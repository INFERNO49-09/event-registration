const router = require("express").Router();
const mongoose = require("mongoose");
const Razorpay = require("razorpay");
const crypto = require("crypto");

const authMiddleware =
  require("../middleware/auth");

const Event = require("../models/Event");
const Registration =
  require("../models/Registration");

const razorpayKeyId =
  process.env.RAZORPAY_KEY_ID?.trim();
const razorpayKeySecret =
  process.env.RAZORPAY_KEY_SECRET?.trim();

const razorpay = new Razorpay({
  key_id: razorpayKeyId,
  key_secret: razorpayKeySecret,
});

const isValidObjectId = (id) =>
  mongoose.Types.ObjectId.isValid(id);

const normalizeRequiredText = (value) =>
  typeof value === "string" ? value.trim() : "";

const sendServerError = (res, error, fallbackMessage) => {
  console.error(fallbackMessage, error);

  return res.status(500).json({
    success: false,
    message: fallbackMessage,
  });
};

const reserveSeat = async (event) =>
  Event.findOneAndUpdate(
    {
      _id: event._id,
      registrations: {
        $lt: event.maxSeats,
      },
    },
    {
      $inc: {
        registrations: 1,
      },
    },
    {
      new: true,
    }
  );

const releaseSeat = async (eventId) =>
  Event.findByIdAndUpdate(eventId, {
    $inc: {
      registrations: -1,
    },
  });

/*
Create Razorpay Order
*/

router.post(
  "/create-order",
  authMiddleware,
  async (req, res) => {
    try {
      const { eventId } =
        req.body;

      if (!isValidObjectId(eventId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid event ID",
        });
      }

      const event =
        await Event.findById(
          eventId
        );

      if (!event) {
        return res.status(404).json({
          success: false,
          message:
            "Event not found",
        });
      }

      const existing =
        await Registration.exists({
          userId: req.user._id,
          eventId,
        });

      if (existing) {
        return res.status(409).json({
          success: false,
          message:
            "Already registered for this event",
        });
      }

      if (
        event.registrations >=
        event.maxSeats
      ) {
        return res.status(409).json({
          success: false,
          message:
            "Event is fully booked",
        });
      }

      if (
        !razorpayKeyId ||
        !razorpayKeySecret
      ) {
        return res.status(500).json({
          success: false,
          message:
            "Razorpay keys are not configured",
        });
      }

      /*
      Free Event
      */

      if (
        Number(event.fee) === 0
      ) {
        return res.json({
          success: true,
          freeEvent: true,
        });
      }

      const amount = Math.round(
        Number(event.fee) * 100
      );

      if (!Number.isInteger(amount) || amount < 100) {
        return res.status(400).json({
          success: false,
          message:
            "Paid events must have a fee of at least ₹1",
        });
      }

      const options = {
        amount,
        currency: "INR",
        receipt:
          "event_" +
          event._id,
      };

      const order =
        await razorpay.orders.create(
          options
        );

      res.json({
        success: true,
        freeEvent: false,
        order,
      });
    } catch (error) {
      return sendServerError(
        res,
        error,
        "Failed to create payment order"
      );
    }
  }
);

/*
Verify Payment
*/

router.post(
  "/verify",
  authMiddleware,
  async (req, res) => {
    try {
      const userId =
        req.user._id;

      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        eventId,
        phone,
        college,
      } = req.body;

      const normalizedPhone =
        normalizeRequiredText(phone);
      const normalizedCollege =
        normalizeRequiredText(college);

      if (
        !isValidObjectId(eventId) ||
        !razorpay_order_id ||
        !razorpay_payment_id ||
        !razorpay_signature ||
        !normalizedPhone ||
        !normalizedCollege
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Payment verification requires event, payment, phone, and college details",
        });
      }

      const body =
        razorpay_order_id +
        "|" +
        razorpay_payment_id;

      const expectedSignature =
        crypto
          .createHmac(
            "sha256",
            process.env
              .RAZORPAY_KEY_SECRET
              ?.trim()
          )
          .update(body)
          .digest("hex");

      const valid =
        expectedSignature ===
        razorpay_signature;

      if (!valid) {
        return res.status(400).json({
          success: false,
          message:
            "Payment verification failed",
        });
      }

      const event =
        await Event.findById(
          eventId
        );

      if (!event) {
        return res.status(404).json({
          success: false,
          message:
            "Event not found",
        });
      }

      const existing =
        await Registration.findOne({
          userId,
          eventId,
        });

      if (existing) {
        return res.status(409).json({
          success: false,
          message:
            "Already registered",
        });
      }

      if (
        event.registrations >=
        event.maxSeats
      ) {
        return res.status(409).json({
          success: false,
          message:
            "Event is fully booked",
        });
      }

      const reservedEvent =
        await reserveSeat(event);

      if (!reservedEvent) {
        return res.status(409).json({
          success: false,
          message:
            "Event is fully booked",
        });
      }

      let registration;

      try {
        registration =
          await Registration.create({
            userId,
            eventId,
            phone: normalizedPhone,
            college: normalizedCollege,
            paymentStatus:
              "paid",
            amountPaid:
              event.fee,
            paymentId:
              razorpay_payment_id,
            orderId:
              razorpay_order_id,
          });
      } catch (error) {
        await releaseSeat(eventId);
        throw error;
      }

      res.json({
        success: true,
        registration,
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message:
            "Already registered",
        });
      }

      return sendServerError(
        res,
        error,
        "Payment verification failed"
      );
    }
  }
);

/*
Free Event Registration
*/

router.post(
  "/free-register",
  authMiddleware,
  async (req, res) => {
    try {
      const userId =
        req.user._id;

      const {
        eventId,
        phone,
        college,
      } = req.body;

      const normalizedPhone =
        normalizeRequiredText(phone);
      const normalizedCollege =
        normalizeRequiredText(college);

      if (
        !isValidObjectId(eventId) ||
        !normalizedPhone ||
        !normalizedCollege
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Registration requires event, phone, and college details",
        });
      }

      const event =
        await Event.findById(
          eventId
        );

      if (!event) {
        return res.status(404).json({
          success: false,
          message:
            "Event not found",
        });
      }

      if (
        Number(event.fee) > 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Use payment flow for paid events",
        });
      }

      const existing =
        await Registration.findOne({
          userId,
          eventId,
        });

      if (existing) {
        return res.status(409).json({
          success: false,
          message:
            "Already registered",
        });
      }

      const reservedEvent =
        await reserveSeat(event);

      if (!reservedEvent) {
        return res.status(409).json({
          success: false,
          message:
            "Event is fully booked",
        });
      }

      let registration;

      try {
        registration =
          await Registration.create({
            userId,
            eventId,
            phone: normalizedPhone,
            college: normalizedCollege,
            paymentStatus:
              "paid",
            amountPaid: 0,
          });
      } catch (error) {
        await releaseSeat(eventId);
        throw error;
      }

      res.json({
        success: true,
        registration,
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message:
            "Already registered",
        });
      }

      return sendServerError(
        res,
        error,
        "Registration failed"
      );
    }
  }
);

module.exports = router;
