import nodemailer from "nodemailer";
import Mailgen from "mailgen";

import dotenv from "dotenv";
dotenv.config();
import ApiError from "./api-error.js";

// ─── Nodemailer Setup (DEV → Mailtrap) ────────────────────────────────
const isProduction = process.env.NODE_ENV === "production";

// ─── Nodemailer Setup (DEV → Mailtrap) ────────────────────────────────
const devTransporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_SMTP_HOST,
  port: Number(process.env.MAILTRAP_SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.MAILTRAP_SMTP_USER,
    pass: process.env.MAILTRAP_SMTP_PASS,
  },
  connectionTimeout: 10000,
  socketTimeout: 15000,
});

// ─── Nodemailer Setup (PROD → Gmail) ──────────────────────────────────
const prodTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
  // ✅ Fix 3: Prevent infinite SMTP hang
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
});

// ─── Mailgen Setup ─────────────────────────────────────────
const mailGenerator = new Mailgen({
  theme: "default",
  product: {
    name: "KaryaDesk App",
    link: process.env.FRONTEND_URL,
  },
});

// ─── MAIN EMAIL FUNCTION ───────────────────────────────────
const sendEmail = async ({ subject, to, mailGenContent }) => {
  if (!subject || !to || !mailGenContent) {
    throw new Error("Please provide subject, recipient, and mailGenContent");
  }

  const emailHtml = mailGenerator.generate(mailGenContent);
  const emailText = mailGenerator.generatePlaintext(mailGenContent);

  const transporter = isProduction ? prodTransporter : devTransporter;
  const from = isProduction
    ? process.env.EMAIL_FROM
    : `"KaryaDesk" <${process.env.MAILTRAP_SMTP_USER}>`;

  try {
    await transporter.sendMail({
      from,
      to,
      subject,
      html: emailHtml,
      text: emailText,
    });
    console.log(
      `✅ Email sent to ${to} via ${isProduction ? "Gmail" : "Mailtrap"}`,
    );
  } catch (err) {
    console.error(`❌ Email send failed:`, err.message);
    throw new ApiError(
      500,
      "Failed to send email, please retry after a few minutes.",
    );
  }
};

// ─── EMAIL TEMPLATES ───────────────────────────
const forgetPasswordMailGenContent = (username, passwordResetUrl) => {
  return {
    body: {
      name: username,
      intro: [
        "We received a request to reset your KaryaDesk account password.",
        "If you didn't make this request, you can safely ignore this email.",
      ],
      action: {
        instructions: "To reset your password, click the button below:",
        button: {
          color: "#dc4d2f",
          text: "Reset Password",
          link: passwordResetUrl,
        },
      },
    },
  };
};

const emailVerificationMailGenContent = (username, emailVerificationUrl) => {
  return {
    body: {
      name: username,
      intro: ["Welcome to KaryaDesk! We're thrilled to have you on board."],
      action: {
        instructions: "To get started, please verify your email address:",
        button: {
          color: "#6e8efb",
          text: "Verify Your Email",
          link: emailVerificationUrl,
        },
      },
      signature: false,
    },
    footer: {
      name: "KaryaDesk Team",
      subtitle: "Simplify your project management",
    },
  };
};

export {
  forgetPasswordMailGenContent,
  emailVerificationMailGenContent,
  sendEmail,
};
