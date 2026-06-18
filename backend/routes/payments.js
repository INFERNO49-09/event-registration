const router = require("express").Router();
const Razorpay = require("razorpay");
const crypto = require("crypto");

const authMiddleware =
  require("../middleware/auth");

const Event = require("../models/Event");
const Registration =
  require("../models/Registration");

const razorpay = new Razorpay({
  key_id:
    process.env.RAZORPAY_KEY_ID,
  key_secret:
    process.env
      .RAZORPAY_KEY_SECRET,
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

      const options = {
        amount:
          event.fee * 100,
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
      res.status(500).json({
        success: false,
        message:
          error.message,
      });
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
        return res.status(400).json({
          success: false,
          message:
            "Already registered",
        });
      }

      const registration =
        await Registration.create({
          userId,
          eventId,
          phone,
          college,
          paymentStatus:
            "paid",
          amountPaid:
            event.fee,
          paymentId:
            razorpay_payment_id,
          orderId:
            razorpay_order_id,
        });

      await Event.findByIdAndUpdate(
        eventId,
        {
          $inc: {
            registrations: 1,
          },
        }
      );

      res.json({
        success: true,
        registration,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error.message,
      });
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
        return res.status(400).json({
          success: false,
          message:
            "Already registered",
        });
      }

      const registration =
        await Registration.create({
          userId,
          eventId,
          phone,
          college,
          paymentStatus:
            "paid",
          amountPaid: 0,
        });

      await Event.findByIdAndUpdate(
        eventId,
        {
          $inc: {
            registrations: 1,
          },
        }
      );

      res.json({
        success: true,
        registration,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  }
);

module.exports = router;