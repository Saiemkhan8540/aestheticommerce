import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useParams, Link } from "react-router-dom";
import Navbar from "../Navbar/Navbar.jsx";
import { ArrowLeft } from "lucide-react";
import SEO from "../../utils/SEO.jsx";

import {
  fetchProducts,
  setSortOption,
  setFilterOptions,
  setCurrentPage,
  resetFilters,
} from "../../Redux/productSlice.js";

import ProductCard from "../Product/Testing/ShopM/ProductCard/ProductCard.jsx";
import FilterDrawer from "../Product/Testing/ShopM/FilterDrawer/FilterDrawer.jsx";
import SortDropdown from "../Product/Testing/ShopM/SortDropdown/SortDropdown.jsx";
import RatingStars from "../Product/RatingStars/RatingStars.jsx";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "../../ui/Button.jsx";
import Pagination from "../Product/Testing/ShopM/Pagination/Pagination.jsx";
import Footersec from "../Footersection/Footersection.jsx";
import "./ShopDetails.css";

const ITEMS_PER_PAGE = 15;

function sortOptionToParam(option) {
  if (!option || option.value === "default") return "default";
  if (option.value === "price" && option.direction === "asc") return "price_asc";
  if (option.value === "price" && option.direction === "desc")
    return "price_desc";
  if (option.value === "rating") return "rating_desc";
  if (option.value === "id") return "createdAt_desc";
  return "default";
}

const ShopDetails = () => {
  const dispatch = useDispatch();
  const { category, subcategory } = useParams();

  const {
    filteredProducts,
    totalProductCount,
    sortOption,
    filterOptions,
    currentPage,
  } = useSelector((state) => state.products);

  const productCount = filteredProducts ? filteredProducts.length : 0;
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const tagFromQuery = searchParams.get("tag");
  const sale = searchParams.get("sale");
  const storeFromQuery = searchParams.get("store");

  const sortOptions = [
    { label: "Relevance", value: "default", direction: "asc" },
    { label: "Lowest Price", value: "price", direction: "asc" },
    { label: "Highest Price", value: "price", direction: "desc" },
    { label: "Top Customer Reviews", value: "rating", direction: "desc" },
    { label: "Most Recent", value: "id", direction: "desc" },
  ];

  // 1) Sync URL (category, subcategory, tag, sale, store) into Redux filter options
  useEffect(() => {
    dispatch(resetFilters());
    const newFilters = { tags: [] };
    if (sale === "true") newFilters.minDiscount = 40;
    if (tagFromQuery) newFilters.tags = [tagFromQuery.toLowerCase()];
    if (storeFromQuery)
      newFilters.storeName = decodeURIComponent(storeFromQuery);
    if (category) newFilters.categoryFilter = category.replace(/-/g, " ");
    else newFilters.categoryFilter = "";
    if (subcategory)
      newFilters.subcategoryFilter = subcategory.replace(/-/g, " ");
    else newFilters.subcategoryFilter = "";
    dispatch(setFilterOptions(newFilters));
    dispatch(setCurrentPage(1));
  }, [dispatch, tagFromQuery, category, subcategory, sale, storeFromQuery]);

  // 2) Fetch products from server whenever filters, sort, or page change
  useEffect(() => {
    const categoryVal =
      category ||
      (filterOptions.categoryFilter &&
        filterOptions.categoryFilter.replace(/\s/g, "-")) ||
      "";
    const subcategoryVal =
      subcategory ||
      (filterOptions.subcategoryFilter &&
        filterOptions.subcategoryFilter.replace(/\s/g, "-")) ||
      "";
    const tagVal =
      tagFromQuery ||
      (filterOptions.tags && filterOptions.tags[0]) ||
      "";
    const tagsVal =
      filterOptions.tags && filterOptions.tags.length > 0
        ? filterOptions.tags
        : undefined;
    const storeVal =
      storeFromQuery || filterOptions.storeName || "";
    const [minPrice, maxPrice] = filterOptions.priceRange || [0, Infinity];

    const params = {
      category: categoryVal || undefined,
      subcategory: subcategoryVal || undefined,
      tag: tagVal || undefined,
      tags: tagsVal,
      store: storeVal || undefined,
      page: currentPage,
      limit: ITEMS_PER_PAGE,
      sort: sortOptionToParam(sortOption),
    };

    if (filterOptions.inStock) params.inStock = true;
    if (minPrice != null && minPrice !== "" && Number(minPrice) > 0)
      params.minPrice = Number(minPrice);
    if (maxPrice != null && maxPrice !== "" && maxPrice !== Infinity)
      params.maxPrice = Number(maxPrice);
    if (
      filterOptions.minDiscount != null &&
      filterOptions.minDiscount !== ""
    ) {
      params.minDiscount = Number(filterOptions.minDiscount);
    }

    dispatch(fetchProducts(params));
  }, [
    dispatch,
    category,
    subcategory,
    tagFromQuery,
    storeFromQuery,
    filterOptions,
    sortOption,
    currentPage,
  ]);

  const handleSort = (option) => {
    dispatch(setSortOption(option));
    dispatch(setCurrentPage(1));
  };

  const handleFilterChange = (newFilters) => {
    dispatch(setFilterOptions(newFilters));
    dispatch(setCurrentPage(1));
  };

  // Server already returns the correct page slice, so no client-side slice here
  const currentProducts = Array.isArray(filteredProducts)
    ? filteredProducts
    : [];
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const resultsLabel =
    totalProductCount > 0
      ? `Showing ${start + 1}-${start + currentProducts.length} of ${totalProductCount} products`
      : `${totalProductCount} products`;
  const totalPages = Math.max(
    1,
    Math.ceil(totalProductCount / ITEMS_PER_PAGE),
  );

  // Shop header: when on a store page, derive from filteredProducts (already scoped by API)
  const getShopInfo = () => {
    const decodedStoreName = storeFromQuery
      ? decodeURIComponent(storeFromQuery)
      : "";
    if (!decodedStoreName) {
      return {
        name: "Shop",
        location: "Location",
        rating: 4.5,
        products: productCount,
        icon: "🏪",
      };
    }
    if (!filteredProducts || filteredProducts.length === 0) {
      return {
        name: decodedStoreName,
        location: "Location",
        rating: 4.5,
        products: 0,
        icon: "🏪",
      };
    }
    const totalRating = filteredProducts.reduce(
      (sum, p) => sum + (p.rating || 0),
      0,
    );
    const averageRating = (totalRating / filteredProducts.length).toFixed(1);
    const sellerName = filteredProducts[0]?.sellerName || "Seller";
    return {
      name: decodedStoreName,
      location: `${sellerName} Seller`,
      rating: parseFloat(averageRating),
      products: filteredProducts.length,
      icon: "🏪",
    };
  };

  const shopInfo = getShopInfo();

  const seoTitle = storeFromQuery
  ? `${shopInfo.name} | Aestheticommerce`
  : `Shop Products | Aestheticommerce`;

const seoDescription = storeFromQuery
  ? `Browse all handmade products from ${shopInfo.name} on Aestheticommerce. Discover unique aesthetic art, crafts and more.`
  : `Explore handmade aesthetic products from top sellers on Aestheticommerce.`;

const seoUrl = storeFromQuery
  ? `${import.meta.env.VITE_APP_URL}/shop-products?store=${storeFromQuery}`
  : `${import.meta.env.VITE_APP_URL}/shop-products`;

  return (
    <div>
       <SEO
      title={seoTitle}
      description={seoDescription}
      url={seoUrl}
    />
      <Navbar />
      <div className="shop-container">
        {/* Shop Header */}
        {storeFromQuery && (
          <div className="shop-header">
            <div className="shop-info-header">
              <div className="shop-icon-name">
                <span className="shop-icon">{shopInfo.icon}</span>
                <div className="shop-details">
                  <h1 className="shop-name">
                    {shopInfo.name || "Unknown Shop"}
                  </h1>
                  <h3></h3>
                  {/* <p className="shop-location">{shopInfo.location}</p> */}
                </div>
              </div>
              <div className="shop-stats-header">
                <div className="rating-display">
                  <h1 className="shop-name">
                    {shopInfo.name || "Unknown Shop"} Store
                    <p className="shop-location">
                      {shopInfo.location || "Unknown Shop"}
                    </p>
                  </h1>
                  <RatingStars rating={shopInfo.rating} />
                  <span className="products-count">
                    {shopInfo.products} Products
                  </span>
                </div>
              </div>
            </div>
            <Link to="/shops" className="back-button">
              <ArrowLeft size={16} />
              <span>Back to Shops</span>
            </Link>
          </div>
        )}

        <div className="shop-toolbar">
          <div className="filter-button-container"></div>

          <div className="sort-container">
            <span className="results-count">
              {resultsLabel}
            </span>
            <SortDropdown
              options={sortOptions}
              selectedOption={sortOption || sortOptions[0]}
              onOptionSelect={handleSort}
            />
          </div>
        </div>

        <FilterDrawer
          open={showFilterDrawer}
          onClose={() => setShowFilterDrawer(false)}
          filterOptions={filterOptions}
          onFilterChange={handleFilterChange}
        />

        <div className="products-container">
          {currentProducts.length === 0 ? (
            <div className="no-products">
              <h3>No products match your filters</h3>
              <p>Try adjusting your filters or search terms.</p>
            </div>
          ) : (
            <div className="product-grid">
              {currentProducts.map((product) => (
                <ProductCard
                  key={product._id || product.id}
                  product={product}
                />
              ))}
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => dispatch(setCurrentPage(page))}
          />
        )}
      </div>
      <Footersec />
    </div>
  );
};

export default ShopDetails;
