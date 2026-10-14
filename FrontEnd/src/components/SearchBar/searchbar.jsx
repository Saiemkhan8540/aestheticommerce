import React, { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./searchbar.css";
import {
  fetchCategories,
  fetchTrendingTags,
  slugify,
} from "../../api/navigationApi";

const defaultCategories = [{ label: "All", value: "" }];

const SearchBar = ({
  value,
  onChange,
  placeholder = "Gifts, decor, and more...",
  showCategory = true,
  showTrending = true,
  variant = "default",
}) => {
  const isControlled = value !== undefined && typeof onChange === "function";
  const [internalQuery, setInternalQuery] = useState("");
  const query = isControlled ? value : internalQuery;
  const [category, setCategory] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [categories, setCategories] = useState(defaultCategories);
  const [trending, setTrending] = useState([]);

  const navigate = useNavigate();
  const isEmbedded = variant === "embedded";

  const updateQuery = (nextValue) => {
    if (isControlled) {
      onChange(nextValue);
      return;
    }
    setInternalQuery(nextValue);
  };

  useEffect(() => {
    if (!showCategory && !showTrending) return;

    let cancelled = false;
    (async () => {
      try {
        const [cats, tags] = await Promise.all([
          showCategory ? fetchCategories() : Promise.resolve([]),
          showTrending ? fetchTrendingTags() : Promise.resolve([]),
        ]);
        if (cancelled) return;
        if (showCategory) {
          setCategories([
            { label: "All", value: "" },
            ...cats.map((c) => ({ label: c.name, value: slugify(c.name) })),
          ]);
        }
        if (showTrending) {
          setTrending(Array.isArray(tags) ? tags : []);
        }
      } catch {
        if (!cancelled) {
          if (showCategory) setCategories(defaultCategories);
          if (showTrending) setTrending([]);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [showCategory, showTrending]);

  const doSearch = () => {
    const q = query.trim();
    if (isEmbedded || (isControlled && !showCategory)) {
      return;
    }
    if (category) {
      if (q) {
        navigate(`/${category}?tag=${encodeURIComponent(q)}`);
      } else {
        navigate(`/${category}`);
      }
      return;
    }
    if (q === "") return;
    navigate(`/products?tag=${encodeURIComponent(q)}`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    doSearch();
  };

  const handleClear = () => updateQuery("");

  const handleTrendingClick = (item) => {
    const enc = encodeURIComponent(item);
    if (category) {
      navigate(`/${category}?tag=${enc}`);
    } else {
      navigate(`/products?tag=${enc}`);
    }
  };

  const formatTrendingLabel = (tag) => {
    if (!tag || typeof tag !== "string") return "";
    return tag
      .split(/[-_\s]+/)
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  return (
    <div
      className={`searchbar-section${isEmbedded ? " searchbar-section--embedded" : ""}`}
    >
      <form
        className={`searchbar-form ${isFocused ? "focused" : ""}`}
        onSubmit={handleSubmit}
      >
        <select
          className="category-dropdown"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {categories.map((cat) => (
            <option key={cat.value || "all"} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>

        <Search className="search-icon1" size={23} />

        <input
          type="search"
          placeholder={placeholder}
          value={query}
          onChange={(e) => updateQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              doSearch();
            }
          }}
          aria-label={placeholder}
        />

        {query && (
          <button
            type="button"
            className="clear-btn"
            onClick={handleClear}
            aria-label="Clear search"
          >
            <X size={20} />
          </button>
        )}

        <button
          type="submit"
          className="submit-btn"
        >
          Search
        </button>
      </form>

      {showTrending && trending.length > 0 && (
        <div className="trending-searches">
          <span>Trending: </span>
          {trending.map((item) => (
            <button
              key={item}
              className="trending-tag"
              type="button"
              onClick={() => handleTrendingClick(item)}
            >
              {formatTrendingLabel(item)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
