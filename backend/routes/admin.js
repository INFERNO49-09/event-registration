const router = require("express").Router();
const mongoose = require("mongoose");
const { Parser } = require("json2csv");

const adminMiddleware =
  require("../middleware/admin");

const Event = require("../models/Event");
const Registration =
  require("../models/Registration");

const isValidObjectId = (id) =>
  mongoose.Types.ObjectId.isValid(id);

/*
Dashboard Statistics
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

      const paidRegistrations =
        await Registration.countDocuments({
          paymentStatus: "paid",
          status: "registered",
        });

      const waitlisted =
        await Registration.countDocuments({
          status: "waitlisted",
        });

      const cancelled =
        await Registration.countDocuments({
          status: "cancelled",
        });

      const checkedIn =
        await Registration.countDocuments({
          checkedIn: true,
        });

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
        paidRegistrations,
        waitlisted,
        cancelled,
        checkedIn,
        totalRevenue,
      });
    } catch (error) {
      console.error("Admin stats failed:", error);
      res.status(500).json({
        success: false,
        message: "Failed to load admin stats",
      });
    }
  }
);

/*
Scan Ticket
*/

router.post(
  "/scan",
  adminMiddleware,
  async (req, res) => {
    try {
      const ticketCode =
        typeof req.body.ticketCode === "string"
          ? req.body.ticketCode.trim().toUpperCase()
          : "";

      if (!ticketCode) {
        return res.status(400).json({
          success: false,
          message: "Ticket code is required",
        });
      }

      const registration =
        await Registration.findOne({
          ticketCode,
        })
          .populate("userId", "name email")
          .populate(
            "eventId",
            "title venue date fee"
          );

      if (!registration) {
        return res.status(404).json({
          success: false,
          message: "Ticket not found",
        });
      }

      if (registration.status === "cancelled") {
        return res.status(409).json({
          success: false,
          message: "Ticket is cancelled",
          registration,
        });
      }

      if (registration.status === "waitlisted") {
        return res.status(409).json({
          success: false,
          message: "Ticket is still waitlisted",
          registration,
        });
      }

      if (
        registration.eventId?.fee > 0 &&
        registration.paymentStatus !== "paid"
      ) {
        return res.status(409).json({
          success: false,
          message: "Ticket payment is not complete",
          registration,
        });
      }

      if (registration.checkedIn) {
        return res.status(200).json({
          success: true,
          duplicate: true,
          message: "Ticket was already checked in",
          registration,
        });
      }

      registration.checkedIn = true;
      registration.checkedInAt = new Date();
      registration.checkedInBy = req.user._id;
      await registration.save();

      return res.json({
        success: true,
        duplicate: false,
        message: "Ticket checked in",
        registration,
      });
    } catch (error) {
      console.error("Ticket scan failed:", error);
      return res.status(500).json({
        success: false,
        message: "Ticket scan failed",
      });
    }
  }
);

/*
Revenue
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
      console.error("Admin revenue failed:", error);
      res.status(500).json({
        success: false,
        message: "Failed to load revenue",
      });
    }
  }
);

/*
Registrations For Event
*/

router.get(
  "/event/:eventId",
  adminMiddleware,
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
      console.error("Admin event registrations failed:", error);
      res.status(500).json({
        success: false,
        message: "Failed to load event registrations",
      });
    }
  }
);

router.get(
  "/export/:eventId",
  adminMiddleware,
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
      console.error("Registration export failed:", error);
      res.status(500).json({
        success: false,
        message: "Failed to export registrations",
      });
    }
  }
);

/*
event Analytics
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
        await Promise.all(
          events.map(async (event) => {
            const [
              registered,
              waitlisted,
              cancelled,
              checkedIn,
              paid,
            ] = await Promise.all([
              Registration.countDocuments({
                eventId: event._id,
                status: "registered",
              }),
              Registration.countDocuments({
                eventId: event._id,
                status: "waitlisted",
              }),
              Registration.countDocuments({
                eventId: event._id,
                status: "cancelled",
              }),
              Registration.countDocuments({
                eventId: event._id,
                checkedIn: true,
              }),
              Registration.countDocuments({
                eventId: event._id,
                paymentStatus: "paid",
              }),
            ]);

            return {
              ...event.toObject(),
              registered,
              waitlisted,
              cancelled,
              checkedIn,
              paid,
              revenue:
                event.fee * paid,
            };
          })
        );

      res.json(analytics);
    } catch (error) {
      console.error("Admin events analytics failed:", error);
      res.status(500).json({
        success: false,
        message: "Failed to load event analytics",
      });
    }
  }
);

module.exports = router;
