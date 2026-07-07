const router = require("express").Router();
const mongoose = require("mongoose");

const Event = require("../models/Event");

const adminMiddleware =
  require("../middleware/admin");

const isValidObjectId = (id) =>
  mongoose.Types.ObjectId.isValid(id);

const cleanText = (value) =>
  typeof value === "string" ? value.trim() : "";

/*
Get All Events
*/

router.get("/", async (req, res) => {
  try {
    const events = await Event.find().sort({
      date: 1,
    });

    res.json(events);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/*
Get Single Event
*/

router.get("/:id", async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID",
      });
    }

    const event = await Event.findById(
      req.params.id
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/*
Create Event
*/

router.post(
  "/",
  adminMiddleware,
  async (req, res) => {
    try {
      const {
        title,
        description,
        venue,
        date,
        fee,
        maxSeats,
        poster,
      } = req.body;

      const eventDate = new Date(date);
      const eventFee = Number(fee || 0);
      const eventMaxSeats =
        Number(maxSeats);

      if (
        !cleanText(title) ||
        !cleanText(description) ||
        !cleanText(venue) ||
        Number.isNaN(eventDate.getTime()) ||
        !Number.isInteger(eventMaxSeats) ||
        eventMaxSeats < 1 ||
        Number.isNaN(eventFee) ||
        eventFee < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Provide title, description, venue, valid date, non-negative fee, and at least one seat",
        });
      }

      const event = await Event.create({
        title: cleanText(title),
        description:
          cleanText(description),
        venue: cleanText(venue),
        date: eventDate,
        fee: eventFee,
        maxSeats: eventMaxSeats,
        poster: cleanText(poster),
      });

      res.status(201).json({
        success: true,
        event,
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
Update Event
*/

router.put(
  "/:id",
  adminMiddleware,
  async (req, res) => {
    try {
      if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid event ID",
        });
      }

      const event =
        await Event.findByIdAndUpdate(
          req.params.id,
          req.body,
          {
            new: true,
            runValidators: true,
          }
        );

      if (!event) {
        return res.status(404).json({
          success: false,
          message: "Event not found",
        });
      }

      res.json({
        success: true,
        event,
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
Delete Event
*/

router.delete(
  "/:id",
  adminMiddleware,
  async (req, res) => {
    try {
      if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid event ID",
        });
      }

      const event =
        await Event.findByIdAndDelete(
          req.params.id
        );

      if (!event) {
        return res.status(404).json({
          success: false,
          message: "Event not found",
        });
      }

      res.json({
        success: true,
        message:
          "Event deleted successfully",
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
