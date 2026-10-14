module.exports.userPaymentFailed = ({ name, orderId }) => {
    return `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">

          <h2 style="color: #E74C3C; margin-bottom: 20px;">
            Payment Unsuccessful
          </h2>

          <p>Dear <strong>${name ? name : "Customer"}</strong>,</p>

          <p>
            We noticed that your recent payment attempt ${orderId ? `for Order <strong>#${orderId}</strong>` : "on your recent order"} was unsuccessful. 
          </p>

          <div style="
            background: #fdf5f5;
            padding: 15px;
            border-left: 4px solid #E74C3C;
            border-radius: 4px;
            margin: 20px 0;
          ">
            <p style="margin: 0; font-size: 15px;">
              <strong>Don't worry!</strong> If any amount was deducted from your account, it will be automatically refunded by your bank within 3-5 business days. Your order has not been cancelled.
            </p>
          </div>

          <p>
            Your items are still waiting for you! You can complete your purchase by trying again with the same payment method, or by choosing a different option (like a different card or UPI).
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://yourwebsite.com/cart" style="
              background-color: #20BFA5; 
              color: white; 
              padding: 12px 24px; 
              text-decoration: none; 
              border-radius: 6px; 
              font-weight: bold; 
              display: inline-block;
            ">
              Retry Payment
            </a>
          </div>

          <p style="color: #888; font-size: 14px;">
            If you are facing issues completing your order, please reply to this email and our support team will be happy to help you.
          </p>
          <br/>

          <p>
            Warm regards,<br/>
            <strong>Aestheticommerce Team</strong>
          </p>

        </div>
    `;
};