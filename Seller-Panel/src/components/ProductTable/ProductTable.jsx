import * as React from "react";
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
  Tooltip,
  Rating,
  Avatar,
  TextField,
  MenuItem,
  Switch,
  FormControlLabel,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { visuallyHidden } from "@mui/utils";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  deleteSellerProduct,
  fetchSellerProducts,
} from "../../Redux/dashboardSlice";
import Confirm from "../Confirm/Confirm";
import { setInfoType } from "../../Redux/dashboardSlice";

const headCells = [
  { id: "serial", label: "#", numeric: false },
  { id: "image", label: "Image", numeric: false },
  { id: "name", label: "Product", numeric: false },
  { id: "category", label: "Category", numeric: false },
  { id: "subCategory", label: "Sub Category", numeric: false },
  { id: "price", label: "Price", numeric: false },
  { id: "sales", label: "Sales", numeric: true },
  { id: "stock", label: "Stock", numeric: true },
  { id: "rating", label: "Rating", numeric: true },
  { id: "actions", label: "Actions", numeric: false },
];

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) return -1;
  if (b[orderBy] > a[orderBy]) return 1;
  return 0;
}

function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function EnhancedTableHead({ order, orderBy, onRequestSort }) {
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? "right" : "left"}
            sortDirection={orderBy === headCell.id ? order : false}
            sx={{
              backgroundColor: "#e6fdf8",
              fontWeight: 700,
              fontSize: "0.875rem",
              color: "#1a1a1a",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              borderBottom: "2px solid #18a893",
              padding: "16px 12px",
              whiteSpace: "nowrap",
            }}
          >
            {headCell.id !== "serial" &&
            headCell.id !== "actions" &&
            headCell.id !== "image" ? (
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : "asc"}
                onClick={createSortHandler(headCell.id)}
                sx={{
                  fontWeight: 700,
                  color: "#1a1a1a",
                  "&:hover": {
                    color: "#20BFA5",
                  },
                  "&.Mui-active": {
                    color: "#20BFA5",
                    fontWeight: 800,
                  },
                  "& .MuiTableSortLabel-icon": {
                    opacity: 1,
                    color: "#20BFA5",
                  },
                }}
              >
                {headCell.label}
                {orderBy === headCell.id && (
                  <Box component="span" sx={visuallyHidden}>
                    {order === "desc"
                      ? "sorted descending"
                      : "sorted ascending"}
                  </Box>
                )}
              </TableSortLabel>
            ) : (
              headCell.label
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

function EnhancedTableToolbar({ filters, setFilters, rows }) {
  const dispatch = useDispatch();
  const { infoType } = useSelector((state) => state.dashboard);
  const handleFilterChange = (field) => (event) => {
    setFilters((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const uniqueCategories = [...new Set(rows.map((row) => row.category))];
  const uniqueSubCategories = [
    ...new Set(rows.map((row) => row.subCategory || row.subcategory)),
  ];

  const menuSx = {
    "& .MuiMenuItem-root": {
      "&:hover": { backgroundColor: "#e6fdf8" },
      "&.Mui-selected": {
        backgroundColor: "#20BFA5 !important",
        color: "#fff",
        "&:hover": { backgroundColor: "#1aa38f !important" },
      },
    },
  };

  const textFieldSX = {
    minWidth: 140,
    backgroundColor: "#ffffff",
    borderRadius: "6px",
    "& .MuiOutlinedInput-root": {
      backgroundColor: "#fff",
      "&:hover fieldset": { borderColor: "#20BFA5" },
      "&.Mui-focused fieldset": { borderColor: "#20BFA5" },
    },
    "& .MuiInputLabel-root.Mui-focused": { color: "#20BFA5" },
    "& .MuiInputBase-root": {
      fontSize: "0.875rem",
    },
  };

  return (
    <Toolbar
      sx={{
        pl: 2,
        pr: 1,
        flexWrap: "wrap",
        gap: 2,
        padding: "16px 24px",
        borderBottom: "2px solid #20bfa5",
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
        Products
      </Typography>

      <FormControl size="small" sx={textFieldSX}>
        <InputLabel>Type</InputLabel>
        <Select
          label="Type"
          value={infoType}
          onChange={(e) => dispatch(setInfoType(e.target.value))}
          MenuProps={{ PaperProps: { sx: menuSx }, disablePortal: true }}
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="deleted">Deleted</MenuItem>
        </Select>
      </FormControl>

      <FormControl size="small" sx={textFieldSX}>
        <InputLabel sx={{ color: filters.category ? "#20BFA5" : "" }}>
          Category
        </InputLabel>
        <Select
          value={filters.category}
          onChange={handleFilterChange("category")}
          MenuProps={{ PaperProps: { sx: menuSx }, disablePortal: true }}
          label="Category"
        >
          <MenuItem value="">All</MenuItem>
          {uniqueCategories.map((cat) => (
            <MenuItem key={cat} value={cat}>
              {cat}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={textFieldSX}>
        <InputLabel sx={{ color: filters.subCategory ? "#20BFA5" : "" }}>
          Sub Category
        </InputLabel>
        <Select
          value={filters.subCategory}
          onChange={handleFilterChange("subCategory")}
          MenuProps={{ PaperProps: { sx: menuSx }, disablePortal: true }}
          label="Sub Category"
        >
          <MenuItem value="">All</MenuItem>
          {uniqueSubCategories.map((sub) => (
            <MenuItem key={sub} value={sub}>
              {sub}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        size="small"
        label="Search"
        value={filters.search}
        onChange={handleFilterChange("search")}
        placeholder="Search products..."
        sx={{ ...textFieldSX, minWidth: 200 }}
      />
    </Toolbar>
  );
}

export default function EnhancedTable({ products: productsProp }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { products, isLoading, infoType } = useSelector(
    (state) => state.dashboard,
  );
  const authState = useSelector((state) => state.auth || {});

  // const seller = authState?.seller ?? null;
  const token = authState?.token || localStorage.getItem("sellerToken");

  const productsToShow =
    productsProp !== undefined && Array.isArray(productsProp)
      ? productsProp
      : products;
  const isDisplayOnly = productsProp !== undefined;

  const [confirmDelete, setConfirmDelete] = React.useState({
    open: false,
    productId: null,
  });
  const [order, setOrder] = React.useState("asc");
  const [orderBy, setOrderBy] = React.useState("name");
  const [page, setPage] = React.useState(0);
  const [dense, setDense] = React.useState(false);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [filters, setFilters] = React.useState({
    category: "",
    subCategory: "",
    search: "",
  });

  React.useEffect(() => {
    if (token && !isDisplayOnly) {
      dispatch(fetchSellerProducts({ infoType, token }));
    }
  }, [dispatch, token, infoType, isDisplayOnly]);

  const handleDelete = (productId) => {
    dispatch(deleteSellerProduct({ productId, token }))
      .unwrap()
      .then(() => {
        dispatch(fetchSellerProducts({ infoType, token }));
        setConfirmDelete({ open: false, productId: null });
      })
      .catch((err) => {
        console.error("Delete failed:", err);
      });
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => setPage(newPage);

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangeDense = (event) => setDense(event.target.checked);

  const filteredRows = productsToShow.filter((row) => {
    return (
      (filters.category === "" || row.category === filters.category) &&
      (filters.subCategory === "" ||
        row.subCategory === filters.subCategory ||
        row.subcategory === filters.subCategory) &&
      (filters.search === "" ||
        row.name.toLowerCase().includes(filters.search.toLowerCase()))
    );
  });

  const visibleRows = React.useMemo(
    () =>
      [...filteredRows]
        .sort(getComparator(order, orderBy))
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [order, orderBy, page, rowsPerPage, filteredRows],
  );

  if (isLoading && !isDisplayOnly) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress sx={{ color: "#20BFA5" }} />
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%" }}>
      <Paper
        sx={{
          width: "100%",
          mb: 2,
          borderRadius: "12px",
          border: "1px solid #20BFA5",
          boxShadow: "0 2px 6px rgba(32,191,165,0.2)",
          overflow: "hidden",
        }}
      >
        <EnhancedTableToolbar
          filters={filters}
          setFilters={setFilters}
          rows={productsToShow}
        />
        <TableContainer>
          <Table sx={{ minWidth: 750 }} size={dense ? "small" : "medium"}>
            <EnhancedTableHead
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
            />
            <TableBody>
              {visibleRows.map((row, index) => (
                <TableRow
                  hover
                  key={row._id}
                  sx={{
                    "&:hover": {
                      backgroundColor: "#e6fdf8 !important",
                      transition: "background-color 0.2s ease",
                    },
                  }}
                >
                  {/* Serial number */}
                  <TableCell
                    sx={{
                      padding: "12px",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: "#666",
                    }}
                  >
                    {page * rowsPerPage + index + 1}
                  </TableCell>

                  {/* Product Image */}
                  <TableCell sx={{ padding: "12px" }}>
                    <Avatar
                      src={
                        row.images && row.images.length > 0 ? row.images[0] : ""
                      }
                      variant="square"
                      alt={row.name}
                      sx={{
                        width: 50,
                        height: 50,
                        border: "2px solid #20BFA5",
                        boxShadow: "0 2px 4px rgba(32,191,165,0.2)",
                      }}
                    />
                  </TableCell>

                  {/* Product Name - BOLD */}
                  <TableCell
                    sx={{
                      padding: "12px",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: "#1a1a1a",
                    }}
                  >
                    {row.name}
                  </TableCell>

                  {/* Category */}
                  <TableCell sx={{ padding: "12px", fontSize: "0.875rem" }}>
                    <Box
                      sx={{
                        display: "inline-block",
                        padding: "4px 10px",
                        backgroundColor: "#e6fdf8",
                        color: "#20BFA5",
                        borderRadius: "8px",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                      }}
                    >
                      {row.category}
                    </Box>
                  </TableCell>

                  {/* Subcategory */}
                  <TableCell sx={{ padding: "12px", fontSize: "0.875rem" }}>
                    {row.subcategory}
                  </TableCell>

                  {/* Price */}
                  <TableCell sx={{ padding: "12px" }}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "2px",
                      }}
                    >
                      {row.originalPrice && (
                        <Typography
                          variant="caption"
                          sx={{
                            textDecoration: "line-through",
                            color: "#999",
                            fontSize: "0.75rem",
                          }}
                        >
                          ₹{row.originalPrice}
                        </Typography>
                      )}
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#20BFA5",
                          fontWeight: 700,
                          fontSize: "0.875rem",
                        }}
                      >
                        ₹{row.discountedPrice || row.price}
                      </Typography>
                    </Box>
                  </TableCell>

                  {/* Sales */}
                  <TableCell
                    align="right"
                    sx={{ padding: "12px", fontSize: "0.875rem" }}
                  >
                    {row.sales
                      ? `${row.sales} sale${row.sales !== 1 ? "s" : ""}`
                      : "0 sales"}
                  </TableCell>

                  {/* Stock */}
                  <TableCell align="right" sx={{ padding: "12px" }}>
                    <Box
                      sx={{
                        display: "inline-block",
                        padding: "4px 12px",
                        borderRadius: "12px",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        backgroundColor:
                          row.inStock > 10 || row.stock > 10
                            ? "#e8f5e9"
                            : row.inStock > 0 || row.stock > 0
                              ? "#fff3e0"
                              : "#ffebee",
                        color:
                          row.inStock > 10 || row.stock > 10
                            ? "#2e7d32"
                            : row.inStock > 0 || row.stock > 0
                              ? "#e65100"
                              : "#c62828",
                      }}
                    >
                      {row.inStock || row.stock}
                    </Box>
                  </TableCell>

                  {/* Rating */}
                  <TableCell align="right" sx={{ padding: "12px" }}>
                    <Rating
                      value={row.rating || 0}
                      readOnly
                      size="small"
                      sx={{
                        color: "#ffa726",
                        "& .MuiRating-icon": {
                          fontSize: "1rem",
                        },
                      }}
                    />
                  </TableCell>

                  {/* Actions */}
                  <TableCell sx={{ padding: "12px" }}>
                    <Box sx={{ display: "flex", gap: "4px" }}>
                      <Tooltip title="View">
                        <IconButton
                          onClick={() =>
                            navigate(`/dashboard/product/${row._id}`)
                          }
                          sx={{
                            padding: "8px",
                            color: "#20BFA5",
                            transition: "all 0.2s ease",
                            "&:hover": {
                              backgroundColor: "rgba(32, 191, 165, 0.1)",
                              color: "#1aa38f",
                              transform: "scale(1.1)",
                            },
                          }}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          onClick={() =>
                            setConfirmDelete({ open: true, productId: row._id })
                          }
                          sx={{
                            padding: "8px",
                            color: "#d32f2f",
                            transition: "all 0.2s ease",
                            "&:hover": {
                              backgroundColor: "rgba(211, 47, 47, 0.08)",
                              transform: "scale(1.1)",
                            },
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}

              {/* Confirm Delete Page */}
              {confirmDelete.open && (
                <Confirm
                  close={() =>
                    setConfirmDelete({ open: false, productId: null })
                  }
                  cancle={() =>
                    setConfirmDelete({ open: false, productId: null })
                  }
                  confirm={() => handleDelete(confirmDelete.productId)}
                  confirmDelete={confirmDelete}
                />
              )}

              {/* No products fallback */}
              {visibleRows.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={10}
                    align="center"
                    sx={{
                      padding: "48px 24px",
                      color: "#666",
                      fontSize: "0.9375rem",
                      fontWeight: 500,
                    }}
                  >
                    No products found
                  </TableCell>
                </TableRow>
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
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            borderTop: "2px solid #20bfa5",
            backgroundColor: "#e6fdf8",
            "& .MuiTablePagination-toolbar": {
              padding: "12px 16px",
            },
            "& .MuiTablePagination-displayedRows": {
              fontWeight: 600,
              color: "#1a1a1a",
              fontSize: "0.875rem",
            },
            "& .MuiTablePagination-selectLabel": {
              fontWeight: 600,
              color: "#1a1a1a",
              fontSize: "0.875rem",
            },
            "& .MuiTablePagination-actions button": {
              color: "#20BFA5",
              "&:hover": {
                color: "#1aa38f",
                backgroundColor: "rgba(32, 191, 165, 0.08)",
              },
            },
          }}
        />
      </Paper>
      <FormControlLabel
        control={
          <Switch
            checked={dense}
            onChange={handleChangeDense}
            sx={{
              "& .MuiSwitch-switchBase.Mui-checked": {
                color: "#20BFA5",
              },
              "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                backgroundColor: "#20BFA5",
              },
            }}
          />
        }
        label="Dense padding"
        sx={{
          marginTop: "12px",
          marginLeft: "8px",
          "& .MuiFormControlLabel-label": {
            fontWeight: 600,
            color: "#555",
            fontSize: "0.875rem",
          },
        }}
      />
    </Box>
  );
}
