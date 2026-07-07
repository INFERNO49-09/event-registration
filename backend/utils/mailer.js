const nodemailer = require("nodemailer");

function hasMailConfig() {
  return Boolean(
    process.env.SMTP_HOST?.trim() &&
      process.env.SMTP_PORT?.trim() &&
      process.env.SMTP_USER?.trim() &&
      process.env.SMTP_PASS?.trim()
  );
}

function createTransporter() {
  if (!hasMailConfig()) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST.trim(),
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER.trim(),
      pass: process.env.SMTP_PASS.trim(),
    },
  });
}

async function sendRegistrationEmail({ user, event, registration }) {
  const transporter = createTransporter();

  if (!transporter || !user?.email) {
    console.log(
      "Email confirmation skipped: SMTP is not configured or user email is missing"
    );
    return;
  }

  const statusLine =
    registration.status === "waitlisted"
      ? `You are on the waitlist at position ${registration.waitlistPosition}.`
      : "Your ticket is confirmed.";

  await transporter.sendMail({
    from:
      process.env.MAIL_FROM ||
      "EventHub <no-reply@example.com>",
    to: user.email,
    subject: `${event.title} registration ${registration.status}`,
    text: [
      `Hi ${user.name},`,
      "",
      statusLine,
      `Event: ${event.title}`,
      `Venue: ${event.venue}`,
      `Date: ${new Date(event.date).toLocaleString("en-IN")}`,
      `Ticket: ${registration.ticketCode}`,
      "",
      "Show this ticket code or QR code at check-in.",
      "",
      "EventHub",
    ].join("\n"),
  });
}

async function sendCancellationEmail({ user, event, registration }) {
  const transporter = createTransporter();

  if (!transporter || !user?.email) {
    return;
  }

  await transporter.sendMail({
    from:
      process.env.MAIL_FROM ||
      "EventHub <no-reply@example.com>",
    to: user.email,
    subject: `${event.title} registration cancelled`,
    text: [
      `Hi ${user.name},`,
      "",
      `Your registration for ${event.title} has been cancelled.`,
      registration.refundStatus === "processed"
        ? "A refund has been created in Razorpay."
        : "No refund was processed for this registration.",
      "",
      "EventHub",
    ].join("\n"),
  });
}

module.exports = {
  sendRegistrationEmail,
  sendCancellationEmail,
};
