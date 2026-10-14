import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
// import { addProduct } from "../../Redux/productSlice";
import { fetchCategories } from "../../Redux/categorySlice";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import styles from "./AddProductForm.module.css";
import axios from "axios"; // added
import CreatableSelect from "react-select/creatable"; 
import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  toolbarPlugin,
  BoldItalicUnderlineToggles,
  UndoRedo,
  ListsToggle,
} from "@mdxeditor/editor";

import "@mdxeditor/editor/style.css";

const API_URL = import.meta.env.VITE_API_URL; // added

export default function AddProductForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // fetch categories from redux
  const { data: categories, loading: categoryLoading } = useSelector(
    (state) => state.categories,
  );

  const { loading, error } = useSelector((state) => state.products);
  // const { seller } = useSelector((state) => state.auth);

  const [submitLoading, setSubmitLoading] = useState(false); // added
  const [submitError, setSubmitError] = useState(""); // added

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    sellingPrice: "",
    discount: "",
    platformFee: "",
    logisticsFee: 60,
    transactionFee: 10,
    calculatedPrice: "",
    discountAmount: 0,
    mrp: "",
    category: "",
    subcategory: "",
    rating: 1,
    inStock: "",
    tags: [],
    images: [], // will hold File objects
    productVideo: null, // single File object
  });

  const [videoPreview, setVideoPreview] = useState("");

  // fetch categories on mount
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // transform categories into react-select format
  const categoryOptions =
    categories?.map((cat) => ({
      value: cat.name,
      label: cat.name,
      subcategories: cat.subcategories,
    })) || [];

  // find selected category object
  // const selectedCategoryObj = categoryOptions.find(
  //   (c) => c.value === formData.category,
  // );

  // subcategories
  // const subcategoryOptions =
  //   selectedCategoryObj?.subcategories?.map((sub) => ({
  //     value: sub.name,
  //     label: sub.name,
  //   })) || [];

  // // dynamic: find selected subcategory object
  // const selectedSubcategoryObj =
  //   selectedCategoryObj?.subcategories?.find(
  //     (sub) => sub.name === formData.subcategory,
  //   ) || null;

  // // dynamic tags from backend
  // const tagOptions =
  //   selectedSubcategoryObj?.keywords?.map((kw) => ({
  //     value: kw,
  //     label: kw,
  //   })) || [];

  // 1. Extract ALL subcategories from ALL categories, without duplicates
  const subcategoryOptions = Array.from(
    new Set(
      categories?.flatMap((cat) =>
        cat.subcategories?.map((sub) => sub.name) || []
      ) || []
    )
  ).map((name) => ({ value: name, label: name }));

  // 2. Extract ALL tags (keywords) from ALL subcategories, without duplicates
  const tagOptions = Array.from(
    new Set(
      categories?.flatMap((cat) =>
        cat.subcategories?.flatMap((sub) => sub.keywords || []) || []
      ) || []
    )
  ).map((kw) => ({ value: kw, label: kw }));

  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      borderColor: state.isFocused ? "#20BFA5" : "#ccc",
      boxShadow: state.isFocused ? "0 0 0 1px #20BFA5" : "none",
      "&:hover": { borderColor: "#20BFA5" },
      borderRadius: "6px",
      padding: "2px",
      cursor: "pointer",
    }),

    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused
        ? "#20BFA520"
        : state.isSelected
          ? "#20BFA5"
          : "white",
      color: state.isSelected ? "white" : "#333",
      cursor: "pointer",
      padding: "10px 12px",
      "&:hover": { backgroundColor: "#20BFA530", color: "#20BFA5" },
    }),

    // SELECTED TAG CHIP
    multiValue: (base) => ({
      ...base,
      backgroundColor: "#20BFA540", // soft mint chip
      borderRadius: "6px",
      padding: "2px 4px",
    }),

    multiValueLabel: (base) => ({
      ...base,
      color: "#0F6F60", // deeper green text
      fontWeight: 500,
    }),

    multiValueRemove: (base) => ({
      ...base,
      color: "#0F6F60",
      ":hover": {
        backgroundColor: "#20BFA5",
        color: "white",
      },
    }),
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // ignore file input here (handled separately)
    if (name === "images") return;

    setFormData((prev) => {
      let updated = { ...prev, [name]: value };

      // Convert selling price to number
      const sellingPrice =
        parseFloat(name === "sellingPrice" ? value : updated.sellingPrice) || 0;
      const discount =
        parseFloat(name === "discount" ? value : updated.discount) || 0;

      // Fees
      const platformFee = Math.round(sellingPrice * 0.15);
      const logisticsFee = 60;
      const transactionFee = 10;

      // Calculated price before discount
      const calculatedPrice =
        sellingPrice + platformFee + logisticsFee + transactionFee;

      // Discount amount
      const discountAmount = calculatedPrice * (discount / 100);

      // MRP as per  formula
      const mrp = calculatedPrice + discountAmount;

      updated.platformFee = platformFee;
      updated.logisticsFee = logisticsFee;
      updated.transactionFee = transactionFee;
      updated.calculatedPrice = calculatedPrice;
      updated.discountAmount = Math.round(discountAmount);
      updated.mrp = Math.round(mrp);

      return updated;
    });
  };

  // new: handle file selection and store File objects
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    setFormData((prev) => ({ ...prev, images: files }));
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedFormats = ["video/mp4", "video/webm", "video/quicktime"];
      if (!allowedFormats.includes(file.type)) {
        alert("Invalid video format. Supported: mp4, webm, mov");
        e.target.value = "";
        return;
      }
      const minSize = 0;
      const maxSize = 20 * 1024 * 1024;
      if (file.size < minSize || file.size > maxSize) {
        alert("Video size must be up to 20MB");
        e.target.value = "";
        return;
      }
      setFormData((prev) => ({ ...prev, productVideo: file }));
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const handleTagsChange = (selectedOptions) => {
    setFormData({
      ...formData,
      tags: selectedOptions ? selectedOptions.map((opt) => opt.value) : [],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requiredFields = [
      "name",
      "description",
      "sellingPrice",
      "mrp",
      "discount",
      "category",
      "subcategory",
      "rating",
      "inStock",
      "images",
    ];

    for (let field of requiredFields) {
      if (
        !formData[field] ||
        (Array.isArray(formData[field]) && formData[field].length === 0)
      ) {
        alert(`Please fill the required field: ${field}`);
        return;
      }
    }

    // Build FormData for multipart upload
    const fd = new FormData();
    fd.append("name", formData.name);
    fd.append("description", formData.description);
    fd.append("sellingPrice", String(formData.sellingPrice));
    fd.append("discountPercentage", String(formData.discount || 0)); // backend expects discountPercentage
    fd.append("platformFee", String(formData.platformFee || 0));
    fd.append("logisticsFee", String(formData.logisticsFee || 60));
    fd.append("transactionFee", String(formData.transactionFee || 10));
    fd.append("mrp", String(formData.mrp));
    fd.append("category", formData.category);
    fd.append("subcategory", formData.subcategory);
    fd.append("rating", String(formData.rating));
    fd.append("inStock", String(formData.inStock));
    fd.append("tags", JSON.stringify(formData.tags));

    // append files under key 'images' (backend uses upload.array("images"))
    formData.images.forEach((file) => {
      fd.append("images", file);
    });

    if (formData.productVideo) {
      fd.append("productVideo", formData.productVideo);
    }

    try {
      setSubmitLoading(true);
      setSubmitError("");

      const token = localStorage.getItem("sellerToken");
      const submitUrl = `${API_URL}/api/products`; // changed: match backend route
      console.log("Submitting product to:", submitUrl);

      // let axios set Content-Type boundary for FormData
      await axios.post(submitUrl, fd, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // on success navigate to my-products
      navigate("/my-products");
    } catch (err) {
      console.error("Submit error", err);
      // show backend message when available
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to submit product for review.";
      console.error("Server response:", err?.response);
      setSubmitError(msg);
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className={styles["page-container"]}>
      <div className={styles["add-product"]}>
        <div className={styles["form-top-bar"]}>
          <h2>Add Product</h2>
          <button
            className={styles["close-btn"]}
            onClick={() => navigate(-1)}
            title="Go back"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles["product-form"]}>
          <label>Product Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          {/* <label>Product Description *</label>
          <textarea
            className={styles["big-textarea"]}
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          /> */}

          <label>Product Description *</label>

          <div className={`${styles["big-textarea"]} ${styles["mdx-wrapper"]}`}>
            <MDXEditor
              markdown={formData.description}
              onChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  description: value,
                }))
              }
              plugins={[
                headingsPlugin(),
                listsPlugin(), // ✅ enables bullet & numbered lists
                quotePlugin(),
                toolbarPlugin({
                  toolbarContents: () => (
                    <>
                      <UndoRedo />
                      <BoldItalicUnderlineToggles />
                      <ListsToggle options={["bullet", "number"]} />
                    </>
                  ),
                }),
              ]}
            />
          </div>

          <div className={styles["form-row"]}>
            <div className={styles["form-col"]}>
              <label>Seller Price *</label>
              <input
                type="number"
                name="sellingPrice"
                value={formData.sellingPrice}
                onChange={handleChange}
                placeholder="Price you want to sell at"
                required
              />
            </div>

            <div className={styles["form-col"]}>
              <label>Discount % *</label>
              <input
                type="number"
                name="discount"
                value={formData.discount}
                onChange={handleChange}
                placeholder="Discount %"
              />
            </div>

            <div className={styles["form-col"]}>
              <label> Platform Fee</label>
              <input
                name="platformFee"
                placeholder="15% of Seller Price"
                value={formData.platformFee}
                readOnly
              />
            </div>

            <div className={styles["form-col"]}>
              <label> Logistics Fee</label>
              <input
                name="logisticsFee"
                value={formData.logisticsFee}
                readOnly
              />
            </div>

            <div className={styles["form-col"]}>
              <label> Transaction Fee</label>
              <input
                name="transactionFee"
                value={formData.transactionFee}
                readOnly
              />
            </div>

            <div className={styles["form-col"]}>
              <label> Calculated Price</label>
              <input
                name="calculatedPrice"
                placeholder="Selling Price + Fees"
                value={formData.calculatedPrice}
                readOnly
              />
            </div>

            <div className={styles["form-col"]}>
              <label> Discount Amount</label>
              <input
                name="discountAmount"
                value={formData.discountAmount}
                readOnly
              />
            </div>

            <div className={styles["form-col"]}>
              <label>MRP *</label>
              <input name="mrp" value={formData.mrp} readOnly />
            </div>
          </div>

          {/* CATEGORY AND SUBCATEGORY */}
<div className={styles["form-row"]}>
  <div className={styles["form-col"]}>
    <label>Category *</label>
    <CreatableSelect
      name="category"
      isLoading={categoryLoading}
      options={categoryOptions}
      value={
        formData.category
          ? { value: formData.category, label: formData.category }
          : null
      }
      onChange={(selected) =>
        setFormData({
          ...formData,
          category: selected.value,
          subcategory: "", // Reset subcategory when category changes
          tags: [], // Reset tags
        })
      }
      placeholder="Select or type a new category"
      styles={customSelectStyles}
    />
  </div>

  {/* <div className={styles["form-col"]}>
    <label>Subcategory *</label>
    <CreatableSelect
      name="subcategory"
      options={subcategoryOptions}
      value={
        formData.subcategory
          ? { value: formData.subcategory, label: formData.subcategory }
          : null
      }
      onChange={(selected) =>
        setFormData({
          ...formData,
          subcategory: selected.value,
          tags: [], // Reset tags when subcategory changes
        })
      }
      placeholder="Select or type a new subcategory"
      isDisabled={!formData.category}
      styles={customSelectStyles}
    />
  </div>
</div>

<div className={styles["form-row"]}>
  <div className={styles["form-col"]}>
    <label>Tags *</label>
    <CreatableSelect
      isMulti
      name="tags"
      options={tagOptions}
      onChange={handleTagsChange}
      value={formData.tags.map((tag) => ({
        value: tag,
        label: tag,
      }))}
      placeholder={
        formData.subcategory
          ? "Select or type to create new tags"
          : "Select a subcategory first"
      }
      isDisabled={!formData.subcategory}
      styles={customSelectStyles}
    />
  </div>
</div> */}

<div className={styles["form-col"]}>
              <label>Subcategory *</label>
              <CreatableSelect
                name="subcategory"
                options={subcategoryOptions}
                value={
                  formData.subcategory
                    ? {
                        value: formData.subcategory,
                        label: formData.subcategory,
                      }
                    : null
                }
                onChange={(selected) =>
                  setFormData({
                    ...formData,
                    subcategory: selected ? selected.value : "",
                  })
                }
                placeholder="Select or type any subcategory"
                /* Removed isDisabled here */
                styles={customSelectStyles}
              />
            </div>
          </div>

          {/* TAGS */}
          <div className={styles["form-row"]}>
            <div className={styles["form-col"]}>
              <label>Tags *</label>
              <CreatableSelect
                isMulti
                name="tags"
                options={tagOptions}
                onChange={handleTagsChange}
                value={formData.tags.map((tag) => ({
                  value: tag,
                  label: tag,
                }))}
                placeholder="Select from all tags or create new ones"
                /* Removed isDisabled here */
                styles={customSelectStyles}
              />
            </div>
          </div>

          <div className={styles["form-row"]}>
            <div className={styles["form-col"]}>
              <label>Rating (1-5) *</label>
              <input
                type="number"
                min="1"
                max="5"
                name="rating"
                value={formData.rating}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles["form-col"]}>
              <label>In Stock *</label>
              <input
                type="number"
                name="inStock"
                value={formData.inStock}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles["form-col"]}>
              <label>Images *</label>
              <input
                type="file"
                name="images"
                multiple
                onChange={handleFileChange}
              />
            </div>

            <div className={styles["form-col"]}>
              <label>Product Video (Max 20MB)</label>
              <input
                type="file"
                name="productVideo"
                accept="video/mp4,video/webm,video/quicktime"
                onChange={handleVideoChange}
              />
              {videoPreview && (
                <div className={styles["video-preview-container"]}>
                  <video src={videoPreview} controls width="200" style={{ borderRadius: '4px' }} />
                  <button
                    type="button"
                    className={styles["remove-video-btn"]}
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, productVideo: null }));
                      setVideoPreview("");
                    }}
                  >
                    &times;
                  </button>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            className={styles["publish-btn"]}
            disabled={loading || submitLoading}
          >
            {loading || submitLoading
              ? "Submitting for Review..."
              : "Submit for Review"}
          </button>

          {(error || submitError) && (
            <p style={{ color: "red" }}>❌ {error || submitError}</p>
          )}
        </form>
      </div>
    </div>
  );
}
