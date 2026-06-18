const router = require("express").Router();
const { Parser } = require("json2csv");

const adminMiddleware =
  require("../middleware/admin");

const Event = require("../models/Event");
const Registration =
  require("../models/Registration");

/*
====================================
Dashboard Statistics
GET /admin/stats
Admin Only
====================================
*/

router.get(
  "/stats",
  adminMiddleware,
  async (req, res) => {
    try {
      const totalEvents =
        await Event.countDocuments();

      const totalRegistrations =
        await Registration.countDocuments();

      const events =
        await Event.find();

      let totalRevenue = 0;

      events.forEach((event) => {
        totalRevenue +=
          event.fee *
          event.registrations;
      });

      res.json({
        totalEvents,
        totalRegistrations,
        totalRevenue,
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
Revenue Per Event
GET /admin/revenue
Admin Only
====================================
*/

router.get(
  "/revenue",
  adminMiddleware,
  async (req, res) => {
    try {
      const events =
        await Event.find();

      const revenueData =
        events.map((event) => ({
          eventId: event._id,
          title: event.title,
          registrations:
            event.registrations,
          fee: event.fee,
          revenue:
            event.fee *
            event.registrations,
        }));

      res.json(revenueData);
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
Registrations For Event
GET /admin/event/:eventId
Admin Only
====================================
*/

router.get(
  "/event/:eventId",
  adminMiddleware,
  async (req, res) => {
    try {
      const registrations =
        await Registration.find({
          eventId:
            req.params.eventId,
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
====================================
CSV Export
GET /admin/export/:eventId
Admin Only
====================================
*/

router.get(
  "/export/:eventId",
  adminMiddleware,
  async (req, res) => {
    try {
      const registrations =
        await Registration.find({
          eventId:
            req.params.eventId,
        })
          .populate(
            "userId",
            "name email"
          )
          .populate(
            "eventId",
            "title"
          );

      const csvData =
        registrations.map(
          (registration) => ({
            Name:
              registration.userId
                ?.name || "",
            Email:
              registration.userId
                ?.email || "",
            Phone:
              registration.phone,
            College:
              registration.college,
            PaymentStatus:
              registration.paymentStatus,
            AmountPaid:
              registration.amountPaid,
          })
        );

      const fields = [
        "Name",
        "Email",
        "Phone",
        "College",
        "PaymentStatus",
        "AmountPaid",
      ];

      const parser =
        new Parser({
          fields,
        });

      const csv =
        parser.parse(csvData);

      res.header(
        "Content-Type",
        "text/csv"
      );

      res.attachment(
        `event-${req.params.eventId}.csv`
      );

      return res.send(csv);
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
All Events With Analytics
GET /admin/events
Admin Only
====================================
*/

router.get(
  "/events",
  adminMiddleware,
  async (req, res) => {
    try {
      const events =
        await Event.find().sort({
          date: 1,
        });

      const analytics =
        events.map((event) => ({
          ...event.toObject(),
          revenue:
            event.fee *
            event.registrations,
        }));

      res.json(analytics);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

module.exports = router;