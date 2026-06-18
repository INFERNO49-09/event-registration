const router = require("express").Router();

const Event = require("../models/Event");

const adminMiddleware =
  require("../middleware/admin");

/*
====================================
Get All Events
GET /events
====================================
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
====================================
Get Single Event
GET /events/:id
====================================
*/

router.get("/:id", async (req, res) => {
  try {
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
====================================
Create Event
POST /events
Admin Only
====================================
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

      if (
        !title ||
        !description ||
        !venue ||
        !date ||
        !maxSeats
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Please fill all required fields",
        });
      }

      const event = await Event.create({
        title,
        description,
        venue,
        date,
        fee: fee || 0,
        maxSeats,
        poster: poster || "",
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
====================================
Update Event
PUT /events/:id
Admin Only
====================================
*/

router.put(
  "/:id",
  adminMiddleware,
  async (req, res) => {
    try {
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
====================================
Delete Event
DELETE /events/:id
Admin Only
====================================
*/

router.delete(
  "/:id",
  adminMiddleware,
  async (req, res) => {
    try {
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