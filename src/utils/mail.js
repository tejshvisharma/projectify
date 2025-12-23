import nodemailer from 'nodemailer';
import mailgen from 'mailgen';
import dotenv from 'dotenv';
dotenv.config({ path: "C:/Users/ojshv/OneDrive/Desktop/projectify/.env" });





const sendEmail = async ({ subject, to, mailGenContent }) => {
   
  if (!subject || !to || !mailGenContent) {
    throw new Error("Please provide subject, recipient, and mailGenContent");
  }
    const transporter = nodemailer.createTransport({
      host: process.env.MAILTRAP_SMTP_HOST,
      port: process.env.MAILTRAP_SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.MAILTRAP_SMTP_USER,
        pass: process.env.MAILTRAP_SMTP_PASS,
      },
    });

   const mailGenerator = new mailgen({
     theme: "default",
     product: {
       name: "Projectify App",
       link: `http://localhost:${process.env.PORT}/`,
     },
   });

    
    // generate html + plain text
    const emailHtml = mailGenerator.generate(mailGenContent);
    const emailText = mailGenerator.generatePlaintext(mailGenContent);

    const mailOptions = {
      from: `"Projectify" <${process.env.MAILTRAP_SMTP_USER}>`,
      to: to,
      subject: subject,
      html: emailHtml,
      text: emailText,
    };

     try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to}`);
  } catch (err) {
    console.error(`❌ Email failed:`, err);
    throw err;
  }
};



const forgetPasswordMailGenContent = (username, passwordResetUrl) => {
  return {
    body: {
      name: username,
      intro: [
        "We received a request to reset your Projectify account password.",
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
      outro: [
        "**If the button doesn't work**, copy and paste this URL into your browser:",
        passwordResetUrl,
        "",
        "This password reset link will expire in 1 hour for security reasons.",
        "Need help or have questions? Just reply to this email - we're always happy to help.",
      ],
    },
  };
};

const emailVerificationMailGenContent = (username, emailVerificationUrl) => {
  return {
    body: {
      name: username,
      intro: [
        "Welcome to KaryaDesk! We're thrilled to have you on board.",
        "Our platform helps teams collaborate more effectively and manage projects with ease.",
      ],
      action: {
        instructions: "To get started, please verify your email address:",
        button: {
          color: "#6e8efb", // More appealing color
          text: "Verify Your Email",
          link: emailVerificationUrl,
        },
      },
      outro: [
        "**If the button doesn't work**, copy and paste this URL into your browser:",
        emailVerificationUrl,
        "",
        "Have any questions or need help? Feel free to reply to this email.",
        "Our support team is here to help you succeed with Projectify!",
      ],
      signature: false, // MailGen will handle this
    },
    footer: {
      name: "KaryaDesk Team",
      subtitle: "Simplify your project management",
    },
  };
};


export { forgetPasswordMailGenContent, emailVerificationMailGenContent, sendEmail}




