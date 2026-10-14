import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Toolbar,
  Typography,
  Paper,
  IconButton,
  Chip,
  TextField,
  MenuItem,
  CircularProgress,
  Avatar,
  Collapse,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { visuallyHidden } from "@mui/utils";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import { useDispatch, useSelector } from "react-redux";
import { fetchSellerOrders, resetOrders } from "../../Redux/dashboardSlice";

const headCells = [
  { id: "expand", label: "", numeric: false },
  { id: "orderId", label: "Order ID", numeric: false },
  { id: "paymentId", label: "Payment ID", numeric: false },
  { id: "customer", label: "Customer", numeric: false },
  { id: "phone", label: "Phone", numeric: false },
  { id: "address", label: "Address", numeric: false },
  { id: "products", label: "Products", numeric: false },
  { id: "amount", label: "Amount", numeric: true },
  { id: "status", label: "Status", numeric: false },
  { id: "date", label: "Date", numeric: false },
  { id: "actions", label: "Actions", numeric: false },
];

// Sorting helpers
const descendingComparator = (a, b, orderBy) =>
  b[orderBy] < a[orderBy] ? -1 : b[orderBy] > a[orderBy] ? 1 : 0;

const getComparator = (order, orderBy) =>
  order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);

// Table Head
const EnhancedTableHead = ({ order, orderBy, onRequestSort }) => {
  const createSortHandler = (property) => (event) =>
    onRequestSort(event, property);

  return (
    <TableHead>
      <TableRow
        sx={{ backgroundColor: "#e6fdf8", borderBottom: "2px solid #18a893" }}
      >
        {headCells.map(({ id, label, numeric }) => (
          <TableCell
            key={id}
            align={numeric ? "right" : "left"}
            sortDirection={orderBy === id ? order : false}
            sx={{
              fontWeight: 700,
              fontSize: "0.9rem",
              color: "#1a1a1a",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              padding: "14px 10px",
            }}
          >
            {id !== "expand" && id !== "products" ? (
              <TableSortLabel
                active={orderBy === id}
                direction={orderBy === id ? order : "asc"}
                onClick={createSortHandler(id)}
                hideSortIcon={orderBy !== id}
                sx={{
                  fontWeight: 700,
                  color: orderBy === id ? "#20BFA5" : "#1a1a1a",
                  "&:hover": { color: "#1aa38f" },
                  "&.Mui-active": { color: "#20BFA5" },
                  "& .MuiTableSortLabel-icon": {
                    opacity: orderBy === id ? 1 : 0,
                    color: "#20BFA5",
                  },
                }}
              >
                {label}
                {orderBy === id && (
                  <Box component="span" sx={visuallyHidden}>
                    {order === "desc"
                      ? "sorted descending"
                      : "sorted ascending"}
                  </Box>
                )}
              </TableSortLabel>
            ) : (
              label
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
};

// Status color mapping
const getStatusColor = (status) => {
  switch (status) {
    case "Dispatched":
      return "info";
    case "Shipped":
      return "primary";
    case "Out for Delivery":
      return "warning";
    case "Delivered":
      return "success";
    case "Cancelled":
      return "error";
    default:
      return "default";
  }
};

// Toolbar with filters
const EnhancedTableToolbar = ({ filters, setFilters }) => {
  const handleFilterChange = (field) => (event) =>
    setFilters((prev) => ({ ...prev, [field]: event.target.value }));

  const statusOptions = [
    "Dispatched",
    "Shipped",
    "Out for Delivery",
    "Delivered",
    "Cancelled",
  ];

  const textFieldSx = {
    minWidth: 140,
    backgroundColor: "#fff",
    borderRadius: "6px",
    "& .MuiOutlinedInput-root": {
      backgroundColor: "#fff",
      "&:hover fieldset": { borderColor: "#20BFA5" },
      "&.Mui-focused fieldset": { borderColor: "#20BFA5" },
    },
    "& .MuiInputLabel-root.Mui-focused": { color: "#20BFA5" },
  };

  return (
    <Toolbar
      sx={{
        pl: 2,
        pr: 1,
        flexWrap: "wrap",
        gap: 2,
        padding: "16px 24px",
        borderBottom: "2px solid #18a893",
        backgroundColor: "#e6fdf8",
      }}
    >
      <Typography
        variant="h6"
        sx={{
          flex: "1 1 100%",
          fontWeight: 700,
          color: "#1a1a1a",
          fontSize: "1.25rem",
          letterSpacing: "-0.02em",
        }}
      >
        Recent Orders
      </Typography>

      <TextField
        size="small"
        select
        label="Status"
        value={filters.status}
        onChange={handleFilterChange("status")}
        sx={textFieldSx}
        SelectProps={{
          MenuProps: {
            disablePortal: true,
            PaperProps: {
              sx: {
                "& .MuiMenuItem-root": {
                  "&:hover": { backgroundColor: "#e6fdf8" },
                  "&.Mui-selected": {
                    backgroundColor: "#20BFA5 !important",
                    color: "#fff",
                    "&:hover": { backgroundColor: "#1aa38f !important" },
                  },
                },
              },
            },
          },
        }}
      >
        <MenuItem value="">All</MenuItem>
        {statusOptions.map((status) => (
          <MenuItem key={status} value={status}>
            {status}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        size="small"
        label="Search"
        value={filters.search}
        onChange={handleFilterChange("search")}
        placeholder="Search Item ID, Order ID, Name, Email"
        sx={{ minWidth: 200, ...textFieldSx }}
      />
    </Toolbar>
  );
};

// Main OrderTable
const OrderTable = () => {
  const dispatch = useDispatch();
  const {
    orders = [],
    isLoading,
    isError,
    message,
  } = useSelector((state) => state.dashboard || {});
  const authState = useSelector((state) => state.auth || {});
  const seller =
    authState?.seller ?? JSON.parse(localStorage.getItem("sellerData"));
  const token = authState?.token ?? localStorage.getItem("sellerToken");
  const sellerId = seller?._id || seller?.sellerId || seller?.id;

  const [order, setOrder] = useState("desc");
  const [orderBy, setOrderBy] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openRow, setOpenRow] = useState(null);
  const [filters, setFilters] = useState({ status: "", search: "" });

  // Status update dialog state
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [documentAction, setDocumentAction] = useState({
    rowId: null,
    type: null,
  });

  useEffect(() => {
    if (sellerId && token) {
      dispatch(fetchSellerOrders({ sellerId, token }));
      return () => dispatch(resetOrders());
    }
  }, [dispatch, sellerId, token]);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  // Open status update dialog
  const handleOpenStatusDialog = (row) => {
    setSelectedRow(row);
    setNewStatus(row.status);
    setStatusDialogOpen(true);
  };

  // Close status update dialog
  const handleCloseStatusDialog = () => {
    setStatusDialogOpen(false);
    setSelectedRow(null);
    setNewStatus("");
  };

  // Update item status
  const handleUpdateStatus = async () => {
    if (!selectedRow || !newStatus) return;

    setIsUpdating(true);
    try {
      console.log("Updating status with data:", {
        orderId: selectedRow.orderId,
        itemId: selectedRow.itemId,
        status: newStatus,
      });

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/orders/seller/item-status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            orderId: selectedRow.orderId,
            itemId: selectedRow.itemId,
            status: newStatus,
          }),
        },
      );

      const data = await response.json();
      console.log("Response:", { status: response.status, data });

      if (!response.ok) {
        throw new Error(data.message || "Failed to update status");
      }

      // Refresh orders after update
      dispatch(fetchSellerOrders({ sellerId, token }));
      handleCloseStatusDialog();
    } catch (error) {
      console.error("Error updating status:", error);
      alert(`Failed to update status: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const escapeHtml = (value) =>
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const downloadBlob = (blob, filename) => {
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(blobUrl);
  };

  const handleDownloadLabel = async (row) => {
    if (!row?.mongoOrderId) {
      alert("Order ID is missing for this label.");
      return;
    }

    setDocumentAction({ rowId: row._id, type: "label" });
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/document/label/${row.mongoOrderId}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      );

      if (!response.ok) {
        throw new Error("Failed to download shipping label");
      }

      const blob = await response.blob();
      downloadBlob(blob, `shipping-label-${row.orderId}.pdf`);
    } catch (error) {
      console.error("Error downloading shipping label:", error);
      alert(error.message || "Unable to download shipping label");
    } finally {
      setDocumentAction({ rowId: null, type: null });
    }
  };

  const handlePrintSlip = (row) => {
    const slipWindow = window.open("", "_blank", "width=900,height=700");
    if (!slipWindow) {
      alert("Please allow pop-ups to print the packing slip.");
      return;
    }

    const productsMarkup = row.products
      .map((product, index) => {
        const productName = product.product?.name || product.productName || "Product";
        const quantity = Number(product.quantity || 1);
        const unitPrice = Number(product.price || 0);
        const lineTotal = quantity * unitPrice;

        return `
          <tr>
            <td>${index + 1}</td>
            <td>${escapeHtml(productName)}</td>
            <td>${quantity}</td>
            <td>Rs. ${unitPrice.toFixed(2)}</td>
            <td>Rs. ${lineTotal.toFixed(2)}</td>
          </tr>
        `;
      })
      .join("");

    const totalAmount = row.products.reduce(
      (sum, product) =>
        sum + Number(product.price || 0) * Number(product.quantity || 1),
      0,
    );

    slipWindow.document.write(`
      <html>
        <head>
          <title>Packing Slip - ${escapeHtml(row.orderId)}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              color: #1f2937;
              margin: 24px;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 2px solid #20BFA5;
              padding-bottom: 16px;
              margin-bottom: 20px;
            }
            .brand {
              font-size: 24px;
              font-weight: 700;
              color: #20BFA5;
            }
            .card-grid {
              display: grid;
              grid-template-columns: repeat(2, minmax(0, 1fr));
              gap: 16px;
              margin-bottom: 20px;
            }
            .card {
              border: 1px solid #d1d5db;
              border-radius: 10px;
              padding: 16px;
            }
            .card h3 {
              margin: 0 0 12px;
              font-size: 16px;
            }
            .muted {
              color: #6b7280;
              font-size: 13px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 12px;
            }
            th, td {
              border: 1px solid #d1d5db;
              padding: 10px;
              text-align: left;
              font-size: 14px;
            }
            th {
              background: #ecfdf5;
            }
            .summary {
              margin-top: 16px;
              text-align: right;
              font-size: 16px;
              font-weight: 700;
            }
            @media print {
              body {
                margin: 12px;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="brand">Aestheticommerce</div>
              <div class="muted">Seller packing slip</div>
            </div>
            <div>
              <div><strong>Order ID:</strong> ${escapeHtml(row.orderId)}</div>
              <div><strong>Item ID:</strong> ${escapeHtml(row.itemId)}</div>
              <div><strong>Date:</strong> ${escapeHtml(
                new Date(row.createdAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                }),
              )}</div>
            </div>
          </div>

          <div class="card-grid">
            <div class="card">
              <h3>Customer Details</h3>
              <div><strong>Name:</strong> ${escapeHtml(row.customer)}</div>
              <div><strong>Phone:</strong> ${escapeHtml(row.phone)}</div>
              <div><strong>Email:</strong> ${escapeHtml(row.email)}</div>
            </div>
            <div class="card">
              <h3>Shipping Address</h3>
              <div>${escapeHtml(row.address)}</div>
              <div>${escapeHtml(row.pincode)}</div>
              <div class="muted">Status: ${escapeHtml(row.status)}</div>
            </div>
          </div>

          <h3>Items in this shipment</h3>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Product</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Line Total</th>
              </tr>
            </thead>
            <tbody>
              ${productsMarkup}
            </tbody>
          </table>

          <div class="summary">Shipment Total: Rs. ${totalAmount.toFixed(2)}</div>
        </body>
      </html>
    `);

    slipWindow.document.close();
    slipWindow.focus();
    slipWindow.print();
  };

  console.log({
    orders,
  });

  // Flatten orders by item ID - each item becomes a separate row
  const transformedOrders = orders.flatMap((order) => {
    // Backend returns sellerProducts, not products
    const products = order.sellerProducts || order.products || [];

    const fullNameFromUser = [
      order.user?.fullname?.firstname,
      order.user?.fullname?.lastname,
    ]
      .filter(Boolean)
      .join(" ");

    // Create a row for each product item
    return products.map((item) => ({
      _id: `${order._id}-${item.itemId || item._id}`,
      mongoOrderId: order._id,
      orderId: order.orderId || order._id,
      itemId: item.itemId || item._id,
      paymentId: order.paymentId || "N/A",
      customer:
        order.shippingAddress?.fullName ||
        fullNameFromUser ||
        "N/A",
      email: order.user?.email || "N/A",
      phone:
        order.user?.phone ||
        order.shippingAddress?.phone ||
        "N/A",
      address:
        order.shippingAddress?.street ||
        order.shippingAddress?.address ||
        "N/A",
      pincode: order.shippingAddress?.pincode || "N/A",
      products: [item], // Single item for this row
      quantity: item.quantity || 1,
      amount: item.price || 0,
      status: item.status
        ? item.status.charAt(0).toUpperCase() +
          item.status.slice(1).toLowerCase()
        : "Processing",
      date: new Date(order.createdAt).getTime(),
      createdAt: order.createdAt,
    }));
  });

  const filteredRows = useMemo(
    () =>
      transformedOrders.filter((row) => {
        const matchesStatus =
          filters.status === "" ||
          row.status?.toLowerCase() === filters.status.toLowerCase();
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          filters.search === "" ||
          row.orderId.toLowerCase().includes(searchLower) ||
          row.itemId.toLowerCase().includes(searchLower) ||
          row.customer.toLowerCase().includes(searchLower) ||
          row.email.toLowerCase().includes(searchLower);
        return matchesStatus && matchesSearch;
      }),
    [transformedOrders, filters],
  );

  const visibleRows = useMemo(
    () =>
      [...filteredRows]
        .sort(getComparator(order, orderBy || "date"))
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [order, orderBy, page, rowsPerPage, filteredRows],
  );

  if (isLoading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress sx={{ color: "#20BFA5" }} />
      </Box>
    );

  if (isError)
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error" sx={{ fontWeight: 600 }}>
          Failed to load orders: {message}
        </Typography>
      </Box>
    );

  return (
    <Box sx={{ width: "100%" }}>
      <Paper
        sx={{
          width: "100%",
          mb: 2,
          borderRadius: "12px",
          boxShadow: "0 4px 7px rgba(32, 191, 165, 0.2)",
          border: "1px solid #20BFA5",
          overflow: "hidden",
        }}
      >
        <EnhancedTableToolbar filters={filters} setFilters={setFilters} />
        <TableContainer>
          <Table sx={{ minWidth: 750 }} size="medium">
            <EnhancedTableHead
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
            />
            <TableBody>
              {visibleRows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={11}
                    align="center"
                    sx={{ py: 6, color: "#666" }}
                  >
                    No orders found
                  </TableCell>
                </TableRow>
              ) : (
                visibleRows.map((row, index) => (
                  <React.Fragment key={row._id}>
                    <TableRow
                      hover
                      sx={{
                        "&:hover": {
                          backgroundColor: "#e6fdf8 !important",
                          transition: "background-color 0.2s ease",
                        },
                      }}
                    >
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() =>
                            setOpenRow(openRow === index ? null : index)
                          }
                          sx={{
                            color: "#20BFA5",
                            "&:hover": { color: "#1aa38f" },
                          }}
                        >
                          {openRow === index ? (
                            <ExpandLessIcon />
                          ) : (
                            <ExpandMoreIcon />
                          )}
                        </IconButton>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontWeight: 700, color: "#20BFA5" }}>
                          {row.orderId}
                        </Typography>
                        {/* <Typography variant="caption" color="text.secondary">
                          Order: {row.orderId}
                        </Typography> */}
                      </TableCell>
                      <TableCell>{row.paymentId}</TableCell>
                      <TableCell>
                        <Typography sx={{ fontWeight: 600 }}>
                          {row.customer}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {row.email}
                        </Typography>
                      </TableCell>
                      <TableCell>{row.phone}</TableCell>
                      <TableCell>
                        <Typography noWrap sx={{ maxWidth: 150 }}>
                          {row.address}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {row.pincode}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", gap: 0.5 }}>
                          {row.products.slice(0, 3).map((item, idx) => (
                            <Avatar
                              key={idx}
                              src={item.product?.images?.[0] || ""}
                              variant="square"
                              sx={{
                                width: 40,
                                height: 40,
                                border: "2px solid #f0f0f0",
                              }}
                            />
                          ))}
                          {row.products.length > 3 && (
                            <Box
                              sx={{
                                width: 40,
                                height: 40,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                bgcolor: "grey.200",
                                borderRadius: 1,
                              }}
                            >
                              <Typography variant="caption" fontWeight={600}>
                                +{row.products.length - 3}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ color: "#20BFA5", fontWeight: 700 }}
                      >
                        ₹{row.amount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 1,
                          }}
                        >
                          <Chip
                            label={row.status}
                            color={getStatusColor(row.status)}
                          />
                          {row.status == "Pending" && (
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleOpenStatusDialog(row)}
                              sx={{
                                fontSize: "0.75rem",
                                borderColor: "#20BFA5",
                                color: "#20BFA5",
                                "&:hover": {
                                  borderColor: "#1aa38f",
                                  backgroundColor: "rgba(32, 191, 165, 0.04)",
                                },
                              }}
                            >
                              Update Status
                            </Button>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {new Date(row.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 1,
                            minWidth: 132,
                          }}
                        >
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={
                              documentAction.rowId === row._id &&
                              documentAction.type === "label" ? (
                                <CircularProgress size={14} sx={{ color: "#fff" }} />
                              ) : (
                                <LocalShippingOutlinedIcon fontSize="small" />
                              )
                            }
                            onClick={() => handleDownloadLabel(row)}
                            disabled={
                              documentAction.rowId === row._id &&
                              documentAction.type === "label"
                            }
                            sx={{
                              backgroundColor: "#20BFA5",
                              "&:hover": { backgroundColor: "#1aa38f" },
                              textTransform: "none",
                            }}
                          >
                            Label PDF
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<PrintOutlinedIcon fontSize="small" />}
                            onClick={() => handlePrintSlip(row)}
                            sx={{
                              borderColor: "#20BFA5",
                              color: "#20BFA5",
                              textTransform: "none",
                              "&:hover": {
                                borderColor: "#1aa38f",
                                backgroundColor: "rgba(32, 191, 165, 0.04)",
                              },
                            }}
                          >
                            Print Slip
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell colSpan={11} sx={{ p: 0 }}>
                        <Collapse in={openRow === index}>
                          <Box
                            sx={{
                              m: 2,
                              p: 2,
                              backgroundColor: "#fafafa",
                              borderRadius: "8px",
                            }}
                          >
                            <Typography
                              variant="subtitle2"
                              sx={{ fontWeight: 700, color: "#2c3e50" }}
                            >
                              Order Details
                            </Typography>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mt: 1 }}
                            >
                              Use "Label PDF" for package pasting and "Print Slip"
                              for a seller-side packing slip.
                            </Typography>
                            {row.products.map((prod, i) => (
                              <Typography key={i}>
                                {prod.product?.name || "Product"} ×{" "}
                                {prod.quantity}
                              </Typography>
                            ))}
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredRows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          sx={{
            backgroundColor: "#e6fdf8",
            "& .MuiTablePagination-toolbar": { minHeight: "56px", gap: 1 },
          }}
        />
      </Paper>

      {/* Status Update Dialog */}
      <Dialog
        open={statusDialogOpen}
        onClose={handleCloseStatusDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, color: "#1a1a1a" }}>
          Update Order Status
        </DialogTitle>
        <DialogContent>
          {selectedRow && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Order ID: <strong>{selectedRow.orderId}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Item ID: <strong>{selectedRow.itemId}</strong>
              </Typography>
              <TextField
                select
                fullWidth
                label="New Status"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&:hover fieldset": { borderColor: "#20BFA5" },
                    "&.Mui-focused fieldset": { borderColor: "#20BFA5" },
                  },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#20BFA5" },
                }}
              >
                <MenuItem value="Dispatched">Dispatched</MenuItem>
              </TextField>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={handleCloseStatusDialog}
            disabled={isUpdating}
            sx={{ color: "#666" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdateStatus}
            disabled={
              isUpdating || !newStatus || newStatus === selectedRow?.status
            }
            variant="contained"
            sx={{
              backgroundColor: "#20BFA5",
              "&:hover": { backgroundColor: "#1aa38f" },
              "&:disabled": { backgroundColor: "#ccc" },
            }}
          >
            {isUpdating ? (
              <CircularProgress size={20} sx={{ color: "#fff" }} />
            ) : (
              "Update"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrderTable;
