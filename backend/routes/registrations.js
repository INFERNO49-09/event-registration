const router = require("express").Router();

const Registration = require("../models/Registration");
const Event = require("../models/Event");

const authMiddleware =
  require("../middleware/auth");

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
        !eventId ||
        !phone ||
        !college
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
          phone,
          college,
          paymentStatus: "pending",
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

      res.status(201).json({
        success: true,
        registration,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
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
      res.status(500).json({
        success: false,
        message: error.message,
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
      res.status(500).json({
        success: false,
        message: error.message,
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

      await Event.findByIdAndUpdate(
        registration.eventId,
        {
          $inc: {
            registrations: -1,
          },
        }
      );

      await Registration.findByIdAndDelete(
        req.params.id
      );

      res.json({
        success: true,
        message:
          "Registration cancelled successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

module.exports = router;