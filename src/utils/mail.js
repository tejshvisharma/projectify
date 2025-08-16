import nodemailer from 'nodemailer';
import mailgen from 'mailgen';
import dotenv from 'dotenv';
dotenv.config({ path: "C:/Users/ojshv/OneDrive/Desktop/projectify/.env" });





const sendEmail = async ({ subject, to, mailGenContent }) => {
   
  console.log(subject);
  console.log(to);
  console.log(mailGenContent);
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
        intro: `we got a request to reset your password`,
        action: {
          instruction: `to forget your password click button below`,
          button: {
            color: "blue",
            text: "forget your password",
            link: passwordResetUrl,
          },
        },
        outro: "have any query or  question feel free to reply...",
      },
    };

}

const emailVerificationMailGenContent = (username, emailVerificationUrl) => {
  return {
    body: {
      name: username,
      intro: `welcome to projectify ! we are glad to have you`,
      action: {
        instruction: `to verify your email, click button below`,
        button: {
          color: `default`,
          text: `verify your email`,
          link: emailVerificationUrl,
        },
      },
      outro: "Have any query or  question feel free to reply...",
    },
  };
};


export { forgetPasswordMailGenContent, emailVerificationMailGenContent, sendEmail}




