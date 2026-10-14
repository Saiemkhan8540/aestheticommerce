const sendEmail = require("../utilsSellerPanel/sendEmail");

const sendOrderEmails = async (order, user) => {
  try {
    // Build product list
    const productListHTML = order.products
      .map(
        (p) => `
        <tr>
          <td style="padding:8px;border:1px solid #ddd;">${p.productName}</td>
          <td style="padding:8px;border:1px solid #ddd;">${p.quantity}</td>
          <td style="padding:8px;border:1px solid #ddd;">₹${p.price}</td>
        </tr>
      `
      )
      .join("");

    // Customer email
    await sendEmail({
      to: user.email,
      subject: "Order Confirmed 🎉",
      html: `
        <h2>Order Confirmed</h2>
        <p>Order ID: <b>${order.orderId}</b></p>
        <table border="1" cellpadding="5" cellspacing="0">
          <tr>
            <th>Product</th>
            <th>Qty</th>
            <th>Price</th>
          </tr>
          ${productListHTML}
        </table>
        <h3>Total: ₹${order.totalAmount}</h3>
      `,
    });

    // Admin email
    await sendEmail({
      to: "aestheticommerce@gmail.com",
      subject: "🚀 New Order Received",
      html: `
        <h2>New Order</h2>
        <p><b>Order ID:</b> ${order.orderId}</p>
        <p><b>User:</b> ${user.email}</p>
        <p><b>Total:</b> ₹${order.totalAmount}</p>
      `,
    });

  } catch (err) {
    console.error("Order email failed:", err);
  }
};

module.exports = { sendOrderEmails };