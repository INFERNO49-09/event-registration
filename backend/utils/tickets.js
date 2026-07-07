const crypto = require("crypto");

function createTicketCode() {
  return `EH-${crypto.randomBytes(9).toString("hex").toUpperCase()}`;
}

module.exports = {
  createTicketCode,
};
