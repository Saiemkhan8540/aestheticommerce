const PDFDocument = require("pdfkit");

const formatOrderCode = (orderId) => {
  const raw = String(orderId || "").trim();
  if (!raw) return "N/A";
  if (raw.length <= 12) return raw;
  return `${raw.slice(0, 6)}-${raw.slice(6, 12)}-${raw.slice(12)}`;
};

const splitAddressLines = (addressText) => {
  const cleaned = String(addressText || "N/A")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (cleaned.length === 0) return ["N/A"];

  const lines = [];
  let current = "";

  cleaned.forEach((part) => {
    const next = current ? `${current}, ${part}` : part;
    if (next.length > 34 && current) {
      lines.push(current);
      current = part;
    } else {
      current = next;
    }
  });

  if (current) lines.push(current);
  return lines;
};

/**
 * Stream shipping label to response
 * @param {object} order normalized order with:
 *  - _id
 *  - recipientName
 *  - recipientPhone
 *  - shippingAddressText
 * @param {Response} res
 */
const streamShippingLabelPDF = async (order, res) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 20, size: "A6" });
      doc.pipe(res);

      const pageWidth =
        doc.page.width - doc.page.margins.left - doc.page.margins.right;
      const left = doc.page.margins.left;
      const top = doc.page.margins.top;
      const dark = "#111111";
      const muted = "#4a4a4a";
      const border = "#b8b8b8";
      const light = "#f2f2f2";
      const addressLines = splitAddressLines(order.shippingAddressText);
      const orderCode = formatOrderCode(order._id);

      doc
        .roundedRect(left, top, pageWidth, 44, 14)
        .fillAndStroke("#111111", "#111111");
      doc
        .fillColor("#ffffff")
        .font("Helvetica-Bold")
        .fontSize(18)
        .text("Shipping Label", left, top + 12, {
          width: pageWidth,
          align: "center",
        });

      const chipY = top + 58;
      doc
        .roundedRect(left, chipY, pageWidth, 28, 10)
        .fillAndStroke("#f2f2f2", border);
      doc
        .fillColor(muted)
        .font("Helvetica")
        .fontSize(9)
        .text("ORDER", left + 12, chipY + 8);
      doc
        .fillColor(dark)
        .font("Helvetica-Bold")
        .fontSize(11)
        .text(orderCode, left + 60, chipY + 7, {
          width: pageWidth - 72,
          align: "left",
        });

      const shipBoxY = chipY + 40;
      const shipBoxHeight = 142;
      doc
        .roundedRect(left, shipBoxY, pageWidth, shipBoxHeight, 14)
        .fillAndStroke("#ffffff", border);

      doc
        .fillColor(dark)
        .font("Helvetica-Bold")
        .fontSize(10)
        .text("SHIP TO", left + 14, shipBoxY + 12);

      doc
        .fillColor(dark)
        .font("Helvetica-Bold")
        .fontSize(16)
        .text(order.recipientName || "Customer", left + 14, shipBoxY + 30, {
          width: pageWidth - 28,
        });

      doc
        .fillColor(muted)
        .font("Helvetica")
        .fontSize(11)
        .text(`Phone: ${order.recipientPhone || "N/A"}`, left + 14, shipBoxY + 56, {
          width: pageWidth - 28,
        });

      const addressBoxY = shipBoxY + 78;
      doc
        .roundedRect(left + 12, addressBoxY, pageWidth - 24, 50, 10)
        .fillAndStroke(light, "#e1efee");

      let currentY = addressBoxY + 10;
      addressLines.slice(0, 3).forEach((line) => {
        doc
          .fillColor(dark)
          .font("Helvetica")
          .fontSize(11)
          .text(line, left + 22, currentY, {
            width: pageWidth - 44,
            align: "left",
          });
        currentY += 13;
      });

      const footerY = shipBoxY + shipBoxHeight + 16;
      doc
        .roundedRect(left, footerY, pageWidth, 34, 12)
        .fillAndStroke("#f2f2f2", border);
      doc
        .fillColor(dark)
        .font("Helvetica-Bold")
        .fontSize(11)
        .text("HANDLE WITH CARE", left, footerY + 11, {
          width: pageWidth,
          align: "center",
        });

      doc.end();
      doc.on("end", resolve);
      doc.on("error", reject);
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = { streamShippingLabelPDF };
