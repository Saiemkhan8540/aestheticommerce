const { Resend } = require("resend");


// const sendEmail= async({to,subject,text,html})=>{
//     try{
//         const transporter = nodemailer.createTransport({
//             service:"gmail",
//             auth:{
//                 user:process.env.EMAIL,
//                 pass:process.env.MAIL_PASS,
//             },
//         })
//         await transporter.sendMail({
//             from: `"My App" <${process.env.EMAIL}>`,
//             to,
//             subject,
//             text,
//             html,
//         });
//     }catch(error){
//          console.error("Email send failed:", error);
//         throw new Error("Email could not be sent");
//     }

if (!process.env.RESEND_API_KEY) {
  console.error(
    "Resend API key is not set. Please set RESEND_API_KEY in your environment variables.",
  );

}

const resend = new Resend(process.env.RESEND_API_KEY);

const DEFAULT_FROM_NAME = "Aestheticommerce";
const DEFAULT_FROM_ADDRESS = "onboarding@resend.dev";

const sendEmail = async ({ to, subject, text, html }) => {
  const mode = process.env.EMAIL_MODE || "production";

  // In test mode, force all emails to your own address
  let finalTo = to;
  if (mode === "test") {
    finalTo = "mishakshita2006@gmail.com";
  }

  const fromName = process.env.EMAIL_FROM_NAME || DEFAULT_FROM_NAME;
  const fromAddress = process.env.EMAIL_FROM_ADDRESS || DEFAULT_FROM_ADDRESS;

  try {
    const { data, error } = await resend.emails.send({
      from: `${fromName} <${fromAddress}>`,
      to: finalTo,
      subject,
      text,
      html,
    });

    if (error) {
      console.error("Resend email error:", {
        message: error.message,
        name: error.name,
        statusCode: error.statusCode,
        // some Resend errors include response body with more details
        body: error.response?.body,
      });
      throw new Error(
        error.message || "Failed to send email via Resend service.",
      );
    }

    console.log("Email sent successfully:", data);
    return data;
  } catch (error) {
    console.error("Email send failed:", error);
    throw error;
  }
};

module.exports = sendEmail;
