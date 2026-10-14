import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useParams } from "react-router-dom";

import {
  fetchProducts,
  setSortOption,
  setFilterOptions,
  setCurrentPage,
  resetFilters,
} from "../../../../../Redux/productSlice";

import ProductCard from "../ProductCard/ProductCard";
import FilterDrawer from "../FilterDrawer/FilterDrawer";
import SortDropdown from "../SortDropdown/SortDropdown";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "../../../../../ui/Button";
import Pagination from "../Pagination/Pagination";
import "./ShopM.css";

const ITEMS_PER_PAGE = 15;

function sortOptionToParam(option) {
  if (!option || option.value === "default") return "default";
  if (option.value === "price" && option.direction === "asc") return "price_asc";
  if (option.value === "price" && option.direction === "desc") return "price_desc";
  if (option.value === "rating") return "rating_desc";
  if (option.value === "id") return "createdAt_desc";
  return "default";
}

const Shop = () => {
  const dispatch = useDispatch();
  const { category, subcategory } = useParams();

  const {
    filteredProducts,
    totalProductCount,
    sortOption,
    filterOptions,
    currentPage,
    loading,
    error,
  } = useSelector((state) => state.products);

  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const totalPages = Math.max(1, Math.ceil(totalProductCount / ITEMS_PER_PAGE));

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const tagFromQuery = searchParams.get("tag");
  const sale = searchParams.get("sale");
  const storeFromQuery = searchParams.get("store");
  const categoryFromQuery = searchParams.get("category");
  const minPriceFromQuery = searchParams.get("minPrice");
  const maxPriceFromQuery = searchParams.get("maxPrice");
  const inStockFromQuery = searchParams.get("inStock");
  const minRatingFromQuery = searchParams.get("minRating");
  const minDiscountFromQuery = searchParams.get("minDiscount");
  const readyToDispatchFromQuery = searchParams.get("readyToDispatch");
  const orderingOptionsFromQuery = searchParams.get("orderingOptions");
  const deliverToFromQuery = searchParams.get("deliverTo");

  const getPageTitle = () => {
    if (sale === "true") return "Sale Products";
    if (tagFromQuery) {
      const formattedTag = tagFromQuery
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      return `${formattedTag}`;
    }
    if (storeFromQuery) {
      return `${storeFromQuery}'s Store`;
    }
    if (subcategory) {
      return `${subcategory
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")}`;
    }
    if (category) {
      return `${category
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")}`;
    }
    return "All Products";
  };

  const sortOptions = [
    { label: 'Relevance', value: 'default', direction: 'asc' },
    { label: 'Lowest Price', value: 'price', direction: 'asc' },
    { label: 'Highest Price', value: 'price', direction: 'desc' },
    { label: 'Top Customer Reviews', value: 'rating', direction: 'desc' },
    { label: 'Most Recent', value: 'id', direction: 'desc' },
  ];

  // Sync URL (category, subcategory, tag, sale, store) into Redux filter options when URL changes
  useEffect(() => {
    dispatch(resetFilters());
    const newFilters = { tags: [] };
    if (sale === "true") newFilters.minDiscount = 40;
    if (tagFromQuery) newFilters.tags = [tagFromQuery.toLowerCase()];
    if (storeFromQuery) newFilters.storeName = storeFromQuery;
    
    // if (category) {
    //   newFilters.categoryFilter = category.replace(/-/g, " ");
    // } else if (categoryFromQuery) {
    //   newFilters.categories = categoryFromQuery.split(",");
    // } else {
    //   newFilters.categoryFilter = "";
    // }
    // Allow the checkboxes to populate even if a base category URL exists
    if (categoryFromQuery) {
      newFilters.categories = categoryFromQuery.split(",");
    } else {
      newFilters.categories = [];
    }

    if (category) {
      newFilters.categoryFilter = category.replace(/-/g, " ");
    } else {
      newFilters.categoryFilter = "";
    }

    if (subcategory) newFilters.subcategoryFilter = subcategory.replace(/-/g, " ");
    else newFilters.subcategoryFilter = "";

    if (minPriceFromQuery || maxPriceFromQuery) {
      newFilters.priceRange = [
        minPriceFromQuery ? parseInt(minPriceFromQuery) : 0,
        maxPriceFromQuery ? parseInt(maxPriceFromQuery) : Infinity
      ];
    }
    if (inStockFromQuery === "true") {
      newFilters.inStock = true;
    }
    if (minRatingFromQuery) newFilters.minRating = parseInt(minRatingFromQuery);
    if (minDiscountFromQuery) newFilters.minDiscount = parseInt(minDiscountFromQuery);
    if (readyToDispatchFromQuery) newFilters.readyToDispatch = readyToDispatchFromQuery.split(",");
    if (orderingOptionsFromQuery) newFilters.orderingOptions = orderingOptionsFromQuery.split(",");
    if (deliverToFromQuery) newFilters.deliverTo = deliverToFromQuery;

    dispatch(setFilterOptions(newFilters));
    dispatch(setCurrentPage(1));
  }, [dispatch, tagFromQuery, category, categoryFromQuery, subcategory, sale, storeFromQuery, minPriceFromQuery, maxPriceFromQuery, inStockFromQuery, minRatingFromQuery, minDiscountFromQuery, readyToDispatchFromQuery, orderingOptionsFromQuery, deliverToFromQuery]);

  // Fetch products from server whenever filters, sort, or page change
  useEffect(() => {
    const categoriesStr = filterOptions.categories && filterOptions.categories.length > 0 
      ? filterOptions.categories.join(",") 
      : "";
    // const categoryVal = category || categoryFromQuery || categoriesStr || (filterOptions.categoryFilter && filterOptions.categoryFilter.replace(/\s/g, "-")) || "";
    const categoryVal = categoryFromQuery || categoriesStr || category || (filterOptions.categoryFilter && filterOptions.categoryFilter.replace(/\s/g, "-")) || "";
    // const categoryVal =categoriesStr || categoryFromQuery || category || "";
    const subcategoryVal = subcategory || (filterOptions.subcategoryFilter && filterOptions.subcategoryFilter.replace(/\s/g, "-")) || "";
    const tagVal = tagFromQuery || (filterOptions.tags && filterOptions.tags[0]) || "";
    const tagsVal = filterOptions.tags && filterOptions.tags.length > 0 ? filterOptions.tags : undefined;
    const storeVal = storeFromQuery || filterOptions.storeName || "";
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
    if (filterOptions.minDiscount)
  params.minDiscount =
    filterOptions.minDiscount;

if (filterOptions.minRating)
  params.minRating =
    filterOptions.minRating;

if (
  filterOptions.subcategories &&
  filterOptions.subcategories.length > 0
) {
  params.subcategory =
    filterOptions.subcategories.join(",");
}
    if (filterOptions.inStock) params.inStock = true;
    if (minPrice != null && minPrice !== "" && Number(minPrice) > 0) params.minPrice = Number(minPrice);
    if (maxPrice != null && maxPrice !== "" && maxPrice !== Infinity) params.maxPrice = Number(maxPrice);
    if (filterOptions.minDiscount != null && filterOptions.minDiscount !== "") params.minDiscount = Number(filterOptions.minDiscount);
    if (filterOptions.readyToDispatch?.length > 0) params.readyToDispatch = filterOptions.readyToDispatch.join(",");
    if (filterOptions.orderingOptions?.length > 0) params.orderingOptions = filterOptions.orderingOptions.join(",");
    if (filterOptions.deliverTo) params.deliverTo = filterOptions.deliverTo;

    dispatch(fetchProducts(params));
  }, [dispatch, category, subcategory, tagFromQuery, storeFromQuery, filterOptions, sortOption, currentPage]);

  const handleSort = (option) => {
    dispatch(setSortOption(option));
    dispatch(setCurrentPage(1));
  };

  const handleFilterChange = (newFilters) => {
    dispatch(setFilterOptions(newFilters));
    dispatch(setCurrentPage(1));
  };

  const handlePageChange = (page) => {
    dispatch(setCurrentPage(page));
  };

  // Server returns the current page only; no client-side slice
  const currentProducts = Array.isArray(filteredProducts) ? filteredProducts : [];
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const resultsLabel =
    totalProductCount > 0
      ? `Showing ${start + 1}-${start + currentProducts.length} of ${totalProductCount} products`
      : `${totalProductCount} products`;

  return (
    <div className="shop-container">
      <h1 className="shop-title">{getPageTitle()}</h1>

      <div className="shop-toolbar">
        <div className="filter-button-container">
          <Button
            variant="outline"
            className="filter-button"
            onClick={() => setShowFilterDrawer(true)}
          >
            <SlidersHorizontal size={16} className="filter-icon" />
            <span>Filters</span>
          </Button>
        </div>

        <div className="sort-container-shopm">
          <span className="results-count results-count-full">{resultsLabel}</span>
          <span className="results-count results-count-short">
            {totalProductCount > 0 ? `${start + 1}-${start + currentProducts.length} of ${totalProductCount}` : "0"}
          </span>
          <SortDropdown
            options={sortOptions}
            selectedOption={sortOption || sortOptions[0]}
            onOptionSelect={handleSort}
            showLabel={true}
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
        {loading ? (
          <div className="no-products">
            <h3>Loading...</h3>
            <p>Fetching products.</p>
          </div>
        ) : error ? (
          <div className="no-products">
            <h3>Unable to load products</h3>
            <p>{error}</p>
          </div>
        ) : currentProducts.length === 0 ? (
          <div className="no-products">
            <h3>No products match your filters</h3>
            <p>Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <div className="product-grid-shopm">
            {currentProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default Shop;