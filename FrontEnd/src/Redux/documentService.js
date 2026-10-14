import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// helper to trigger download
const downloadFile = (data, filename) => {
  const url = window.URL.createObjectURL(new Blob([data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

// Fetch Invoice
const getInvoice = async (orderId) => {
  console.log("Fetching invoice for order:", orderId);
  const res = await axios.get(`${API_URL}/api/document/invoice/${orderId}`, {
    responseType: "blob",
  });
  downloadFile(res.data, `invoice_${orderId}.pdf`);
  return true;
};

// Fetch Shipping Label
const getLabel = async (orderId) => {
  console.log("Fetching label for order:", orderId);
  const res = await axios.get(`${API_URL}/api/document/label/${orderId}`, {
    responseType: "blob",
  });
  downloadFile(res.data, `label_${orderId}.pdf`);
  return true;
};

const documentService = { getInvoice, getLabel };
export default documentService;
