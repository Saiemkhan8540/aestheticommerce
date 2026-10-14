module.exports.forgotPasswordTemplet = ({name, otp })=>{
    return `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">

          <h2 style="color: #20BFA5; margin-bottom: 20px;">
            Password Reset OTP
          </h2>

          <p>Dear <strong>${name?name:"Seller"}</strong>,</p>

          <p>
            You requested a password reset. Please use the following One-Time Password (OTP) to reset your password.
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
            This OTP is valid for <strong>2 minutes</strong> only. Please enter this code on the Aestheticommerce website to proceed.
          </p>

          <p style="color: #888; font-size: 14px;">
            If you did not request this password reset, please ignore this email.
          </p>
            <br/>

            <p>
              Thanks,<br/>
                <strong>Aestheticommerce Team</strong>
            </p>

        </div>
    `
}
