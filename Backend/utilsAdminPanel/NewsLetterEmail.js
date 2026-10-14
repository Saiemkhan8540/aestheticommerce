const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

function sendNewsLetter(to, subject, html) {
  return transporter.sendMail({
    from: `"Company Name" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html
  });
}

module.exports = sendNewsLetter;
