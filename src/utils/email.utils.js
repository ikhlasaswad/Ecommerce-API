const nodemailer = require("nodemailer");

// Dev-friendly: if SMTP env vars aren't set, log the email content instead of
// actually sending it. Swap in real SMTP credentials later without changing
// any calling code.
const isEmailConfigured = Boolean(
  process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS
);

const transporter = isEmailConfigured
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587", 10),
      secure: process.env.SMTP_PORT === "465",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  : null;

const sendPasswordResetEmail = async (to, resetLink) => {
  if (!isEmailConfigured) {
    console.log("\n===== [DEV MODE] Password reset email not actually sent =====");
    console.log(`To: ${to}`);
    console.log(`Reset link: ${resetLink}`);
    console.log("================================================================\n");
    return;
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: "Reset your password",
    html: `
      <p>You requested a password reset.</p>
      <p><a href="${resetLink}">Click here to reset your password</a></p>
      <p>This link expires in 15 minutes. If you didn't request this, ignore this email.</p>
    `,
  });
};

module.exports = { sendPasswordResetEmail };