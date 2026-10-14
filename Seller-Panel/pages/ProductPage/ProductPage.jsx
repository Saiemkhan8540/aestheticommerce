import React, { useEffect, useCallback, useState, useMemo } from "react";
import Layout from "../../src/components/Layouts/Layout";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchSellerProducts } from "../../src/Redux/dashboardSlice";
import ProductTable from "../../src/components/ProductTable/ProductTable";
import {
  CircularProgress,
  Box,
  Typography,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  MenuItem,
  TextField,
  Paper,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  Add as AddIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  NewReleases as NewReleasesIcon,
  FilterList as FilterListIcon,
  Inventory as InventoryIcon,
} from "@mui/icons-material";
import "./ProductPage.css";

const timeFilterOptions = [
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "year", label: "This Year" },
  { value: "all", label: "All Time" },
];

const ProductsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [timeFilter, setTimeFilter] = useState("all");
  const [lastRefreshed, setLastRefreshed] = useState(null);

  // ✅ Get data from dashboardSlice instead of productSlice
  const { products, isLoading, isError, message } = useSelector(
    (state) => state.dashboard
  );
  const token = useSelector((state) => state.auth?.token);

  // 🔹 Filter products by date
  const filteredProducts = useMemo(() => {
    if (!products?.length || timeFilter === "all") return products || [];

    const now = new Date();
    const filterDate = new Date();

    switch (timeFilter) {
      case "today":
        filterDate.setHours(0, 0, 0, 0);
        break;
      case "week":
        filterDate.setDate(now.getDate() - 7);
        break;
      case "month":
        filterDate.setMonth(now.getMonth() - 1);
        break;
      case "year":
        filterDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return products;
    }

    return products.filter((p) => {
      const createdDate = new Date(p.createdAt);
      return createdDate >= filterDate;
    });
  }, [products, timeFilter]);

  // 🔹 Calculate dashboard stats
  const dashboardStats = useMemo(() => {
    const stats = {
      topSelling: null,
      mostFavorited: null,
      lowestSelling: null,
      newlyArrived: null,
    };

    if (!filteredProducts?.length) return stats;

    stats.topSelling = filteredProducts.reduce((prev, current) =>
      (prev.salesCount || prev.sold || 0) >
      (current.salesCount || current.sold || 0)
        ? prev
        : current
    );

    stats.mostFavorited = filteredProducts.reduce((prev, current) =>
      (prev.favorites || prev.likes || prev.wishlistCount || 0) >
      (current.favorites || current.likes || current.wishlistCount || 0)
        ? prev
        : current
    );

    const productsWithSales = filteredProducts.filter(
      (p) => (p.salesCount || p.sold || 0) > 0
    );
    if (productsWithSales.length > 0) {
      stats.lowestSelling = productsWithSales.reduce((prev, current) =>
        (prev.salesCount || prev.sold || 0) <
        (current.salesCount || current.sold || 0)
          ? prev
          : current
      );
    }

    stats.newlyArrived = filteredProducts.reduce((prev, current) => {
      const prevDate = new Date(prev.createdAt || 0);
      const currentDate = new Date(current.createdAt || 0);
      return currentDate > prevDate ? current : prev;
    });

    return stats;
  }, [filteredProducts]);

  // 🔹 Fetch products using dashboardSlice thunk
  const fetchProductsData = useCallback(() => {
    const infoType="all";
    if (!token) return;
    console.log("📦 Fetching seller products...");
    return dispatch(fetchSellerProducts({infoType,token}))
      .unwrap()
      .then((data) => {
        console.log("✅ Products fetched:", data);
        setLastRefreshed(new Date());
      })
      .catch((err) => {
        console.error("❌ Failed to fetch products:", err);
      });
  }, [dispatch, token]);

  // 🔹 Initial fetch
  useEffect(() => {
    fetchProductsData();
  }, [fetchProductsData]);

  const handleRefresh = () => {
    fetchProductsData();
  };

  const formatLastRefreshed = () => {
    if (!lastRefreshed) return "";
    const now = new Date();
    const diff = Math.floor((now - lastRefreshed) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  return (
    <Layout>
      <Container maxWidth="xl" className="products-page">
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Box>
            <Typography
              variant="h4"
              component="h1"
              fontWeight="700"
              sx={{ color: "#23272d", mb: 0.5 }}
            >
              Product Dashboard
            </Typography>
            {lastRefreshed && (
              <Typography
                variant="caption"
                sx={{
                  color: "#8d98af",
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                <RefreshIcon sx={{ fontSize: 14 }} />
                Last updated: {formatLastRefreshed()}
              </Typography>
            )}
          </Box>
          <Box display="flex" gap={2}>
            <TextField
              select
              size="small"
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <FilterListIcon sx={{ mr: 1, color: "#20BFA5", fontSize: 20 }} />
                ),
              }}
              sx={{
                minWidth: 180,
                backgroundColor: "#fff",
                borderRadius: "8px",
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "#ebecf0" },
                  "&:hover fieldset": { borderColor: "#20BFA5" },
                  "&.Mui-focused fieldset": { borderColor: "#20BFA5" },
                },
              }}
            >
              {timeFilterOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            <Tooltip title="Refresh Data">
              <span>
                <IconButton
                  onClick={handleRefresh}
                  disabled={isLoading}
                  sx={{
                    border: "1px solid",
                    borderColor: "#ebecf0",
                    color: "#20BFA5",
                    "&:hover": { backgroundColor: "#f5f5f5" },
                    borderRadius: "8px",
                  }}
                >
                  <RefreshIcon />
                </IconButton>
              </span>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate("/addProduct")}
              sx={{
                textTransform: "none",
                fontWeight: 500,
                backgroundColor: "#20BFA5",
                color: "white",
                borderRadius: "8px",
                padding: "10px 20px",
                "&:hover": { backgroundColor: "#1aa891" },
              }}
            >
              Add Product
            </Button>
          </Box>
        </Box>

        <Box display="flex" justifyContent="space-between" alignItems="center" mt={1.5}>
          <Typography
            variant="body1"
            sx={{ color: "#636b7b", fontSize: "1em", fontWeight: 400 }}
          >
            Overview and management of your product catalog
          </Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <Box display="flex" alignItems="center" gap={1}>
              <InventoryIcon sx={{ fontSize: 18, color: "#20BFA5" }} />
              <Typography variant="body2" sx={{ color: "#636b7b" }}>
                <strong style={{ color: "#23272d" }}>{products?.length || 0}</strong> Total
                Products
              </Typography>
            </Box>
            {timeFilter !== "all" && (
              <Box display="flex" alignItems="center" gap={1}>
                <FilterListIcon sx={{ fontSize: 18, color: "#20BFA5" }} />
                <Typography variant="body2" sx={{ color: "#636b7b" }}>
                  <strong style={{ color: "#23272d" }}>
                    {filteredProducts?.length || 0}
                  </strong>{" "}
                  Filtered
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* 🔹 Stats Cards + Product Table UI unchanged from your version */}
      {/* ⬇️ KEEP your existing cards and ProductTable section as-is */}
      {/* Just ensure it uses filteredProducts & products from dashboardSlice */}


{/* Stats Cards */}
<Grid container spacing={3} sx={{ mb: 4 }}>
  <Grid item xs={12} sm={6} lg={3}>
    <Card
      elevation={0}
      sx={{
        height: "100%",
        borderRadius: "18px",
        border: "1.5px solid #ebecf0",
        boxShadow: "0 6px 32px rgba(44, 62, 80, 0.13)",
        transition: "box-shadow 0.25s, border-color 0.25s",
        "&:hover": {
          boxShadow: "0 12px 40px rgba(44, 62, 80, 0.18)",
          borderColor: "#d2d8df",
        },
      }}
    >
      <CardContent sx={{ position: "relative", p: "28px 24px 22px 26px" }}>
        <Box position="absolute" top={16} right={16}>
          <TrendingUpIcon sx={{ fontSize: 24, color: "#20BFA5", opacity: 0.7 }} />
        </Box>
        <Typography variant="body2" sx={{ color: "#343b50", fontSize: "1.06em", fontWeight: 500, mb: 1.5 }}>
          Top Selling
        </Typography>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            color: "#22283d",
            mb: 1,
            letterSpacing: "-1px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: "200px",
          }}
          title={dashboardStats.topSelling ? dashboardStats.topSelling.name : "N/A"}
        >
          {dashboardStats.topSelling ? dashboardStats.topSelling.name : "N/A"}
        </Typography>
        {dashboardStats.topSelling && (
          <Box display="flex" alignItems="center" mt={1}>
            <Typography variant="body2" sx={{ color: "#20BFA5", fontWeight: 600 }}>
              {dashboardStats.topSelling.salesCount || dashboardStats.topSelling.sold || 0} sold
            </Typography>
            <Typography variant="body2" sx={{ color: "#8d98af", ml: 1 }}>
              this period
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  </Grid>

  <Grid item xs={12} sm={6} lg={3}>
    <Card elevation={0} sx={{
      height: "100%", borderRadius: "18px", border: "1.5px solid #ebecf0",
      boxShadow: "0 6px 32px rgba(44, 62, 80, 0.13)", transition: "box-shadow 0.25s, border-color 0.25s",
      "&:hover": { boxShadow: "0 12px 40px rgba(44, 62, 80, 0.18)", borderColor: "#d2d8df" }
    }}>
      <CardContent sx={{ position: "relative", p: "28px 24px 22px 26px" }}>
        <Box position="absolute" top={16} right={16}>
          <StarIcon sx={{ fontSize: 24, color: "#20BFA5", opacity: 0.7 }} />
        </Box>
        <Typography variant="body2" sx={{ color: "#343b50", fontSize: "1.06em", fontWeight: 500, mb: 1.5 }}>
          Most Favorited
        </Typography>
        <Typography variant="h5" sx={{
          fontWeight: 700, color: "#22283d", mb: 1, letterSpacing: "-1px",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "200px"
        }} title={dashboardStats.mostFavorited ? dashboardStats.mostFavorited.name : "N/A"}>
          {dashboardStats.mostFavorited ? dashboardStats.mostFavorited.name : "N/A"}
        </Typography>
        {dashboardStats.mostFavorited && (
          <Box display="flex" alignItems="center" mt={1}>
            <Typography variant="body2" sx={{ color: "#20BFA5", fontWeight: 600 }}>
              {dashboardStats.mostFavorited.favorites || dashboardStats.mostFavorited.likes || dashboardStats.mostFavorited.wishlistCount || 0} favorites
            </Typography>
            <Typography variant="body2" sx={{ color: "#8d98af", ml: 1 }}>
              total
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  </Grid>

  <Grid item xs={12} sm={6} lg={3}>
    <Card elevation={0} sx={{
      height: "100%", borderRadius: "18px", border: "1.5px solid #ebecf0",
      boxShadow: "0 6px 32px rgba(44, 62, 80, 0.13)", transition: "box-shadow 0.25s, border-color 0.25s",
      "&:hover": { boxShadow: "0 12px 40px rgba(44, 62, 80, 0.18)", borderColor: "#d2d8df" }
    }}>
      <CardContent sx={{ position: "relative", p: "28px 24px 22px 26px" }}>
        <Box position="absolute" top={16} right={16}>
          <TrendingDownIcon sx={{ fontSize: 24, color: "#20BFA5", opacity: 0.7 }} />
        </Box>
        <Typography variant="body2" sx={{ color: "#343b50", fontSize: "1.06em", fontWeight: 500, mb: 1.5 }}>
          Lowest Selling
        </Typography>
        <Typography variant="h5" sx={{
          fontWeight: 700, color: "#22283d", mb: 1, letterSpacing: "-1px",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "200px"
        }} title={dashboardStats.lowestSelling ? dashboardStats.lowestSelling.name : "N/A"}>
          {dashboardStats.lowestSelling ? dashboardStats.lowestSelling.name : "N/A"}
        </Typography>
        {dashboardStats.lowestSelling && (
          <Box display="flex" alignItems="center" mt={1}>
            <Typography variant="body2" sx={{ color: "#20BFA5", fontWeight: 600 }}>
              {dashboardStats.lowestSelling.salesCount || dashboardStats.lowestSelling.sold || 0} sold
            </Typography>
            <Typography variant="body2" sx={{ color: "#8d98af", ml: 1 }}>
              needs attention
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  </Grid>

  <Grid item xs={12} sm={6} lg={3}>
    <Card elevation={0} sx={{
      height: "100%", borderRadius: "18px", border: "1.5px solid #ebecf0",
      boxShadow: "0 6px 32px rgba(44, 62, 80, 0.13)", transition: "box-shadow 0.25s, border-color 0.25s",
      "&:hover": { boxShadow: "0 12px 40px rgba(44, 62, 80, 0.18)", borderColor: "#d2d8df" }
    }}>
      <CardContent sx={{ position: "relative", p: "28px 24px 22px 26px" }}>
        <Box position="absolute" top={16} right={16}>
          <NewReleasesIcon sx={{ fontSize: 24, color: "#20BFA5", opacity: 0.7 }} />
        </Box>
        <Typography variant="body2" sx={{ color: "#343b50", fontSize: "1.06em", fontWeight: 500, mb: 1.5 }}>
          Newly Arrived
        </Typography>
        <Typography variant="h5" sx={{
          fontWeight: 700, color: "#22283d", mb: 1, letterSpacing: "-1px",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "200px"
        }} title={dashboardStats.newlyArrived ? dashboardStats.newlyArrived.name : "N/A"}>
          {dashboardStats.newlyArrived ? dashboardStats.newlyArrived.name : "N/A"}
        </Typography>
        {dashboardStats.newlyArrived && (
          <Box display="flex" alignItems="center" mt={1}>
            <Typography variant="body2" sx={{ color: "#20BFA5", fontWeight: 600 }}>
              {new Date(dashboardStats.newlyArrived.createdAt).toLocaleDateString()}
            </Typography>
            <Typography variant="body2" sx={{ color: "#8d98af", ml: 1 }}>
              added
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  </Grid>
</Grid>


      <Paper
        elevation={0}
        sx={{
          borderRadius: "18px",
          border: "1.5px solid #ebecf0",
          boxShadow: "0 6px 32px rgba(44, 62, 80, 0.13)",
          overflow: "hidden",
          mb: 4,
        }}
      >
        <Box
          p={3}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          bgcolor="background.paper"
          sx={{ borderBottom: "1px solid", borderColor: "divider" }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, color: "#23272d" }}>
            All Products
          </Typography>
          <Typography variant="body2" sx={{ color: "#636b7b" }}>
            Showing {filteredProducts?.length || 0} of {products?.length || 0}{" "}
            {products?.length === 1 ? "product" : "products"}
          </Typography>
        </Box>

        <Box sx={{ overflowX: "auto" }}>
          {isLoading && !products?.length ? (
            <Box display="flex" justifyContent="center" my={8} p={4}>
              <Box textAlign="center">
                <CircularProgress size={60} thickness={4} sx={{ color: "#20BFA5" }} />
                <Typography variant="body1" mt={2} sx={{ color: "#636b7b" }}>
                  Loading products...
                </Typography>
              </Box>
            </Box>
          ) : isError ? (
            <Box
              p={3}
              bgcolor="#ffebee"
              borderRadius="14px"
              textAlign="center"
              m={2}
            >
              <Typography variant="h6" color="error" gutterBottom>
                Error Loading Products
              </Typography>
              <Typography sx={{ color: "#636b7b" }} paragraph>
                {message || "Failed to load products. Please try again."}
              </Typography>
              <Button
                variant="contained"
                onClick={handleRefresh}
                disabled={isLoading}
                sx={{
                  backgroundColor: "#20BFA5",
                  color: "white",
                  borderRadius: "8px",
                  "&:hover": { backgroundColor: "#1aa891" },
                }}
              >
                Retry
              </Button>
            </Box>
          ) : (
            <Box className="products-container">
              {filteredProducts?.length > 0 ? (
                <ProductTable products={filteredProducts} />
              ) : products?.length > 0 ? (
                <Box p={6} textAlign="center">
                  <FilterListIcon sx={{ fontSize: 64, color: "#d2d8df", mb: 2 }} />
                  <Typography variant="h6" sx={{ color: "#343b50", mb: 1 }}>
                    No products found for the selected time period
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={() => setTimeFilter("all")}
                    sx={{
                      borderColor: "#20BFA5",
                      color: "#20BFA5",
                      "&:hover": {
                        borderColor: "#1aa891",
                        backgroundColor: "rgba(32, 191, 165, 0.04)",
                      },
                    }}
                  >
                    Clear Filters
                  </Button>
                </Box>
              ) : (
                <Box p={6} textAlign="center">
                  <InventoryIcon sx={{ fontSize: 64, color: "#d2d8df", mb: 2 }} />
                  <Typography variant="h6" sx={{ color: "#343b50", mb: 1 }}>
                    No products yet
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate("/addProduct")}
                    sx={{
                      backgroundColor: "#20BFA5",
                      color: "white",
                      borderRadius: "8px",
                      padding: "10px 24px",
                      "&:hover": { backgroundColor: "#1aa891" },
                    }}
                  >
                    Add Your First Product
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  </Layout>
  );
};

export default ProductsPage;