import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import {
  setFilterOptions,
  resetFilters as resetFilterAction,
} from "../../../../../Redux/productSlice";
import { fetchCategories } from "../../../../../api/navigationApi";
import { Checkbox } from "../../../../../ui/checkbox/checkbox";
import { Label } from "../../../../../ui/Label/Label";
import { RadioGroup, RadioGroupItem } from "../../../../../ui/radio-group";
import { Button } from "../../../../../ui/Button";
import { X, ChevronDown, ChevronUp, Star } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "../../../../../ui/sheet";
import "./FilterDrawer.css";

const FilterDrawer = ({ open, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const filterOptions = useSelector((state) => state.products.filterOptions);

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [showAllCategories, setShowAllCategories] = useState(false);

  const [expandedCategory, setExpandedCategory] = useState(null);

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [inStock, setInStock] = useState(false);
  const [minDiscount, setMinDiscount] = useState("");
  const [minRating, setMinRating] = useState("");

  // New states
  const [priceRangeMode, setPriceRangeMode] = useState("any");
  const [readyToDispatch, setReadyToDispatch] = useState([]);
  const [orderingOptions, setOrderingOptions] = useState([]);
  const [deliverTo, setDeliverTo] = useState("");

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setCategoriesLoading(true);
        const data = await fetchCategories();
        setCategories(data);
      } catch (error) {
        console.error("Failed to load categories:", error);
      } finally {
        setCategoriesLoading(false);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    if (filterOptions) {
      const pMin = filterOptions.priceRange?.[0] || 0;
      const pMax = filterOptions.priceRange?.[1] || Infinity;
      setMinPrice(pMin > 0 ? String(pMin) : "");
      setMaxPrice(pMax < Infinity ? String(pMax) : "");
      
      const isCustomPrice = pMin > 0 || pMax < Infinity;
      setPriceRangeMode(isCustomPrice ? "custom" : "any");

      setSelectedCategories(filterOptions.categories || []);
      setSelectedSubcategories(filterOptions.subcategories || []);
      setInStock(filterOptions.inStock || false);
      setMinDiscount(filterOptions.minDiscount ? String(filterOptions.minDiscount) : "");
      setMinRating(filterOptions.minRating ? String(filterOptions.minRating) : "");

      setReadyToDispatch(filterOptions.readyToDispatch || []);
      setOrderingOptions(filterOptions.orderingOptions || []);
      setDeliverTo(filterOptions.deliverTo || "");
    }
  }, [filterOptions]);

  const updateSearchUrl = (updates = {}) => {
    const searchParams = new URLSearchParams(location.search);

    const cats = updates.categories !== undefined ? updates.categories : selectedCategories;
    const subs = updates.subcategories !== undefined ? updates.subcategories : selectedSubcategories;
    const isStock = updates.inStock !== undefined ? updates.inStock : inStock;
    const minVal = updates.minPrice !== undefined ? updates.minPrice : minPrice;
    const maxVal = updates.maxPrice !== undefined ? updates.maxPrice : maxPrice;
    const discountVal = updates.minDiscount !== undefined ? updates.minDiscount : minDiscount;
    const ratingVal = updates.minRating !== undefined ? updates.minRating : minRating;
    const readyVal = updates.readyToDispatch !== undefined ? updates.readyToDispatch : readyToDispatch;
    const orderOptsVal = updates.orderingOptions !== undefined ? updates.orderingOptions : orderingOptions;
    const delivVal = updates.deliverTo !== undefined ? updates.deliverTo : deliverTo;

    if (cats.length > 0) searchParams.set("category", cats.join(","));
    else searchParams.delete("category");

    if (subs.length > 0) searchParams.set("subcategory", subs.join(","));
    else searchParams.delete("subcategory");

    if (minVal && Number(minVal) > 0) searchParams.set("minPrice", minVal);
    else searchParams.delete("minPrice");

    if (maxVal && Number(maxVal) < Infinity) searchParams.set("maxPrice", maxVal);
    else searchParams.delete("maxPrice");

    if (isStock) searchParams.set("inStock", "true");
    else searchParams.delete("inStock");

    if (discountVal) searchParams.set("minDiscount", discountVal);
    else searchParams.delete("minDiscount");

    if (ratingVal) searchParams.set("minRating", ratingVal);
    else searchParams.delete("minRating");

    if (readyVal.length > 0) searchParams.set("readyToDispatch", readyVal.join(","));
    else searchParams.delete("readyToDispatch");

    if (orderOptsVal.length > 0) searchParams.set("orderingOptions", orderOptsVal.join(","));
    else searchParams.delete("orderingOptions");

    if (delivVal) searchParams.set("deliverTo", delivVal);
    else searchParams.delete("deliverTo");

    navigate(`?${searchParams.toString()}`, { replace: true });
  };

  const handleUpdateReduxAndUrl = (updates) => {
    const nextCategories = updates.categories !== undefined ? updates.categories : selectedCategories;
    const nextSubcategories = updates.subcategories !== undefined ? updates.subcategories : selectedSubcategories;
    const nextInStock = updates.inStock !== undefined ? updates.inStock : inStock;
    const nextMin = updates.minPrice !== undefined ? updates.minPrice : minPrice;
    const nextMax = updates.maxPrice !== undefined ? updates.maxPrice : maxPrice;

    const nextMinNum = nextMin ? Number(nextMin) : 0;
    const nextMaxNum = nextMax ? Number(nextMax) : Infinity;

    const nextDiscount = updates.minDiscount !== undefined ? updates.minDiscount : minDiscount;
    const nextRating = updates.minRating !== undefined ? updates.minRating : minRating;
    const nextReady = updates.readyToDispatch !== undefined ? updates.readyToDispatch : readyToDispatch;
    const nextOrderOpts = updates.orderingOptions !== undefined ? updates.orderingOptions : orderingOptions;
    const nextDeliv = updates.deliverTo !== undefined ? updates.deliverTo : deliverTo;

    dispatch(
      setFilterOptions({
        categories: nextCategories,
        subcategories: nextSubcategories,
        priceRange: [nextMinNum, nextMaxNum],
        inStock: nextInStock,
        minDiscount: nextDiscount ? Number(nextDiscount) : null,
        minRating: nextRating ? Number(nextRating) : null,
        readyToDispatch: nextReady,
        orderingOptions: nextOrderOpts,
        deliverTo: nextDeliv,
      })
    );

    updateSearchUrl(updates);
  };

  const handleCategoryChange = (categoryName, checked) => {
    let newCategories = checked
      ? [...selectedCategories, categoryName]
      : selectedCategories.filter((c) => c !== categoryName);

    if (checked && expandedCategory !== categoryName) {
      setExpandedCategory(categoryName);
    }

    setSelectedCategories(newCategories);
    handleUpdateReduxAndUrl({ categories: newCategories });
  };

  const handleSubcategoryChange = (subName, checked) => {
    let newSubs = checked
      ? [...selectedSubcategories, subName]
      : selectedSubcategories.filter((s) => s !== subName);

    setSelectedSubcategories(newSubs);
    handleUpdateReduxAndUrl({ subcategories: newSubs });
  };

  const handlePriceModeChange = (mode) => {
    setPriceRangeMode(mode);
    if (mode === "any") {
      setMinPrice("");
      setMaxPrice("");
      handleUpdateReduxAndUrl({ minPrice: "", maxPrice: "" });
    }
  };

  const handlePriceBlur = () => {
    handleUpdateReduxAndUrl({ minPrice, maxPrice });
  };

  const handleArrayToggle = (array, setter, value, key) => {
    const newArray = array.includes(value)
      ? array.filter((item) => item !== value)
      : [...array, value];
    setter(newArray);
    handleUpdateReduxAndUrl({ [key]: newArray });
  };

  const resetFilters = () => {
    setMinPrice("");
    setMaxPrice("");
    setPriceRangeMode("any");
    setSelectedCategories([]);
    setSelectedSubcategories([]);
    setInStock(false);
    setMinDiscount("");
    setMinRating("");
    setReadyToDispatch([]);
    setOrderingOptions([]);
    setDeliverTo("");

    dispatch(resetFilterAction());
    navigate(`/products`, { replace: true });
    onClose();
  };

  const toggleCategoryExpand = (catName) => {
    setExpandedCategory(expandedCategory === catName ? null : catName);
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="left" className={`filter-drawer-content`}>
        <div className="filter-drawer-container">
          <SheetHeader className="filter-drawer-header">
            <div className="filter-header-content">
              <SheetTitle className="filter-drawer-title">Filters</SheetTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="close-button"
              >
                <X className="h-5 w-5 text-gray-500" />
              </Button>
            </div>
          </SheetHeader>

          <div className="filter-drawer-scrollable-content custom-scrollbar">
            {/* Category Section */}
            <div className="filter-section">
              <h3 className="filter-section-title">Categories</h3>
              <div className="filter-options">
                {categoriesLoading ? (
                  <div className="filter-loading-skeleton"></div>
                ) : (
                  (showAllCategories ? categories : categories.slice(0, 5)).map(
                    (category, index) => {
                      const catId = category._id || index;
                      const isExpanded = expandedCategory === category.name;
                      const hasSubs = category.subcategories && category.subcategories.length > 0;
                      return (
                        <div key={catId} className="category-group">
                          <div className="filter-option category-header">
                            <Checkbox
                              id={`category-${catId}`}
                              checked={selectedCategories.includes(category.name)}
                              onCheckedChange={(checked) => handleCategoryChange(category.name, checked)}
                            />
                            <Label htmlFor={`category-${catId}`} className="filter-option-label">
                              {category.name}
                            </Label>
                            {hasSubs && (
                              <button
                                className="expand-sub-btn"
                                onClick={() => toggleCategoryExpand(category.name)}
                              >
                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                              </button>
                            )}
                          </div>
                          {isExpanded && hasSubs && (
                            <div className="subcategories-list">
                              {category.subcategories.map((sub, idx) => (
                                <div key={idx} className="filter-option subcategory-item">
                                  <Checkbox
                                    id={`sub-${sub.name}`}
                                    checked={selectedSubcategories.includes(sub.name)}
                                    onCheckedChange={(checked) => handleSubcategoryChange(sub.name, checked)}
                                  />
                                  <Label htmlFor={`sub-${sub.name}`} className="filter-option-label subcat-label">
                                    {sub.name}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    }
                  )
                )}
              </div>
              {categories.length > 5 && (
                <button
                  className="show-more-btn"
                  onClick={() => setShowAllCategories(!showAllCategories)}
                >
                  {showAllCategories ? "Show less" : "Show more"}
                </button>
              )}
            </div>

            {/* Price Filter */}
            <div className="filter-section">
              <h3 className="filter-section-title">Price Range</h3>
              
              <RadioGroup
                value={priceRangeMode}
                onValueChange={handlePriceModeChange}
                className="price-radio-group mb-4 gap-2 flex flex-col"
              >
                <div className="filter-option">
                  <RadioGroupItem value="any" id="price-any" />
                  <Label htmlFor="price-any" className="filter-option-label">
                    Any price
                  </Label>
                </div>
                <div className="filter-option">
                  <RadioGroupItem value="custom" id="price-custom" />
                  <Label htmlFor="price-custom" className="filter-option-label">
                    Custom price
                  </Label>
                </div>
              </RadioGroup>

              {priceRangeMode === "custom" && (
                <div className="price-range-inputs">
                  <div className="currency-input-container">
                    <span className="currency-symbol">₹</span>
                    <input
                      type="number"
                      id="min-price"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      onBlur={handlePriceBlur}
                      className="price-input"
                      min="0"
                    />
                  </div>
                  <span className="price-range-separator">to</span>
                  <div className="currency-input-container">
                    <span className="currency-symbol">₹</span>
                    <input
                      type="number"
                      id="max-price"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      onBlur={handlePriceBlur}
                      className="price-input"
                      min="0"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Ready to dispatch */}
            <div className="filter-section">
              <h3 className="filter-section-title">Ready to dispatch in</h3>
              <div className="filter-options">
                <div className="filter-option">
                  <Checkbox
                    id="dispatch-1day"
                    checked={readyToDispatch.includes("1day")}
                    onCheckedChange={() =>
                      handleArrayToggle(readyToDispatch, setReadyToDispatch, "1day", "readyToDispatch")
                    }
                  />
                  <Label htmlFor="dispatch-1day" className="filter-option-label">
                    1 business day
                  </Label>
                </div>
                <div className="filter-option">
                  <Checkbox
                    id="dispatch-1-3days"
                    checked={readyToDispatch.includes("1-3days")}
                    onCheckedChange={() =>
                      handleArrayToggle(readyToDispatch, setReadyToDispatch, "1-3days", "readyToDispatch")
                    }
                  />
                  <Label htmlFor="dispatch-1-3days" className="filter-option-label">
                    1-3 business days
                  </Label>
                </div>
              </div>
            </div>

            {/* Ordering Options */}
            <div className="filter-section">
              <h3 className="filter-section-title">Ordering options</h3>
              <div className="filter-options">
                <div className="filter-option">
                  <Checkbox
                    id="accepts-gift-cards"
                    checked={orderingOptions.includes("gift-cards")}
                    onCheckedChange={() =>
                      handleArrayToggle(orderingOptions, setOrderingOptions, "gift-cards", "orderingOptions")
                    }
                  />
                  <Label htmlFor="accepts-gift-cards" className="filter-option-label">
                    Accepts gift cards
                  </Label>
                </div>
                <div className="filter-option">
                  <Checkbox
                    id="can-be-gift-wrapped"
                    checked={orderingOptions.includes("gift-wrapped")}
                    onCheckedChange={() =>
                      handleArrayToggle(orderingOptions, setOrderingOptions, "gift-wrapped", "orderingOptions")
                    }
                  />
                  <Label htmlFor="can-be-gift-wrapped" className="filter-option-label">
                    Can be gift-wrapped
                  </Label>
                </div>
                <div className="filter-option">
                  <Checkbox
                    id="customizable"
                    checked={orderingOptions.includes("customizable")}
                    onCheckedChange={() =>
                      handleArrayToggle(orderingOptions, setOrderingOptions, "customizable", "orderingOptions")
                    }
                  />
                  <Label htmlFor="customizable" className="filter-option-label">
                    Customizable
                  </Label>
                </div>
              </div>
            </div>

            {/* Discount Filter */}
            <div className="filter-section">
              <h3 className="filter-section-title">Discount</h3>
              <div className="pill-group">
                {[10, 25, 40, 50].map((disc) => (
                  <button
                    key={disc}
                    className={`filter-pill ${minDiscount === String(disc) ? "active" : ""}`}
                    onClick={() => {
                      const newVal = minDiscount === String(disc) ? "" : String(disc);
                      setMinDiscount(newVal);
                      handleUpdateReduxAndUrl({ minDiscount: newVal });
                    }}
                  >
                    {disc}% or more
                  </button>
                ))}
              </div>
            </div>

            {/* Rating Filter */}
            <div className="filter-section">
              <h3 className="filter-section-title">Customer Reviews</h3>
              <div className="rating-options">
                {[4, 3, 2].map((r) => (
                  <div
                    key={r}
                    className={`rating-row ${minRating === String(r) ? "active" : ""}`}
                    onClick={() => {
                      const newVal = minRating === String(r) ? "" : String(r);
                      setMinRating(newVal);
                      handleUpdateReduxAndUrl({ minRating: newVal });
                    }}
                  >
                    <div className="stars-container">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className={i < r ? "star-filled" : "star-empty"}
                          fill={i < r ? "currentColor" : "none"}
                        />
                      ))}
                    </div>
                    <span className="rating-text">& Up</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Deliver to Filter */}
            <div className="filter-section">
              <h3 className="filter-section-title">Deliver to</h3>
              <select
                className="deliver-to-select"
                value={deliverTo}
                onChange={(e) => {
                  setDeliverTo(e.target.value);
                  handleUpdateReduxAndUrl({ deliverTo: e.target.value });
                }}
              >
                <option value="">Anywhere</option>
                <option value="India">India</option>
                <option value="USA">USA</option>
                <option value="UK">UK</option>
                <option value="Canada">Canada</option>
                <option value="Australia">Australia</option>
              </select>
            </div>

            {/* In Stock Only */}
            <div className="filter-section border-none pb-8">
              <div className="filter-option toggle-option">
                <div className="toggle-info">
                  <Label htmlFor="in-stock" className="filter-option-label toggle-title">
                    In Stock Expected
                  </Label>
                  <span className="toggle-subtitle">Show only available products</span>
                </div>
                <div className="custom-switch">
                  <input
                    type="checkbox"
                    id="in-stock"
                    checked={inStock}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setInStock(checked);
                      handleUpdateReduxAndUrl({ inStock: checked });
                    }}
                    className="switch-checkbox"
                  />
                  <label htmlFor="in-stock" className="switch-label"></label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="filter-drawer-footer">
          <div className="filter-action-buttons">
            <Button size="sm" variant="outline" className="reset-btn" onClick={resetFilters}>
              Clear All
            </Button>
            <Button className="apply-btn" onClick={onClose}>
              View Results
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default FilterDrawer;