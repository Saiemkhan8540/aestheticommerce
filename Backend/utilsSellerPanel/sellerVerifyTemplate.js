module.exports.sellerVerifyTemplate = ({ otp }) => {
    return `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
  
            <h2 style="color: #20BFA5;">Seller Account Verification</h2>

            <p>Hello,</p>

            <p>
              Thank you for registering as a seller with <strong>Aestheticommerce</strong>.
              Please use the One-Time Password (OTP) below to verify your seller account.
            </p>

          <div style="
            background: #f2f2f2;
            padding: 15px;
            font-size: 28px;
            font-weight: bold;
            text-align: center;
            letter-spacing: 5px;
            border-radius: 6px;
            margin: 20px 0;
          ">
            ${otp}
          </div>

            <p>
              This OTP is valid for <strong>5 minutes</strong>. 
              Do not share this code with anyone for security reasons.
            </p>

            <p style="color: #888; font-size: 14px;">
              If you did not request this verification, please ignore this email.
            </p>

            <br>

            <p>
              Regards,<br>
              <strong>Aestheticommerce Team</strong>
            </p>
        </div>
    `
}
