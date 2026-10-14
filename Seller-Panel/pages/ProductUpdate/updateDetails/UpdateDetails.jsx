import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories } from "../../../src/Redux/categorySlice";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import toast from "react-hot-toast";
import BackButton from "../../../src/components/Common/BackButton/BackButton";
import "./updateDetails.css";
import {
  BoldItalicUnderlineToggles,
  ListsToggle,
  MDXEditor,
  UndoRedo,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  toolbarPlugin,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";


const API_URL = import.meta.env.VITE_API_URL;

export default function UpdateDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { data: categories, loading: categoryLoading } = useSelector(
    (state) => state.categories
  );

  const [isFetching, setIsFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    subcategory: "",
    rating: 1,
    inStock: "",
    tags: [],
    productVideo: null,
  });
  const [videoPreview, setVideoPreview] = useState("");
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);

  useEffect(() => {
    dispatch(fetchCategories());
    const fetchProduct = async () => {
      try {
        const token = localStorage.getItem("sellerToken");
        const res = await axios.get(`${API_URL}/api/productinfo/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const p = res.data;
        setFormData({
          name: p.name || "",
          description: p.description || "",
          category: p.category || "",
          subcategory: p.subcategory || "",
          rating: p.rating || 1,
          inStock: p.inStock || "",
          tags: p.tags || [],
          productVideo: p.productVideo || null,
        });
        if (p.productVideo) {
          setVideoPreview(p.productVideo);
        }
        setExistingImages(p.images || []);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError(err?.response?.data?.message || "Failed to load product");
      } finally {
        setIsFetching(false);
      }
    };
    fetchProduct();
  }, [id]);

  const categoryOptions = categories?.map((cat) => ({
    value: cat.name,
    label: cat.name,
    subcategories: cat.subcategories,
  })) || [];

  const subcategoryOptions = Array.from(
    new Set(
      categories?.flatMap((cat) =>
        cat.subcategories?.map((sub) => sub.name) || []
      ) || []
    )
  ).map((name) => ({ value: name, label: name }));

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
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused
        ? "#20BFA520"
        : state.isSelected
          ? "#20BFA5"
          : "white",
      color: state.isSelected ? "white" : "#333",
      padding: "10px 12px",
      "&:hover": { backgroundColor: "#20BFA530", color: "#20BFA5" },
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: "#20BFA540",
      borderRadius: "6px",
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: "#0F6F60",
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
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!formData.name.trim()) return "Product name is required";
    if (formData.name.trim().length < 2) return "Product name must be at least 2 characters";
    if (!formData.description.trim()) return "Description is required";
    if (formData.description.trim().length < 5) return "Description must be at least 5 characters";
    if (!formData.category.trim()) return "Category is required";
    if (!formData.subcategory.trim()) return "Subcategory is required";

    if (formData.inStock === "" || isNaN(formData.inStock)) {
      return "Stock is required";
    }

    if (Number(formData.inStock) < 0) {
      return "Stock cannot be negative";
    }

    if (formData.rating === "" || isNaN(formData.rating)) {
      return "Rating is required";
    }

    if (Number(formData.rating) < 1 || Number(formData.rating) > 5) {
      return "Rating must be between 1 and 5";
    }

    const totalImages = existingImages.length + newImages.length;
    if (totalImages < 1) {
      return "At least one product image is required";
    }
    if (totalImages > 5) {
      return "Maximum 5 images allowed";
    }

    return null;
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        alert("Invalid image format. Supported: jpeg, png, webp, gif");
        e.target.value = "";
        return;
      }
    }

    const combinedCount = existingImages.length + newImages.length + files.length;
    if (combinedCount > 5) {
      alert("Maximum 5 images allowed");
      e.target.value = "";
      return;
    }

    setNewImages((prev) => [...prev, ...files]);
    setNewImagePreviews((prev) => [
      ...prev,
      ...files.map((file) => URL.createObjectURL(file)),
    ]);
    e.target.value = "";
  };

  const removeExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => {
      const url = prev[index];
      if (url) URL.revokeObjectURL(url);
      return prev.filter((_, i) => i !== index);
    });
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
      const maxSize = 20 * 1024 * 1024; // 20MB
      if (file.size > maxSize) {
        alert("Video size must be up to 20MB");
        e.target.value = "";
        return;
      }
      setFormData((prev) => ({ ...prev, productVideo: file }));
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    setSuccess(false);
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("sellerToken");

      const fd = new FormData();
      fd.append("name", formData.name);
      fd.append("description", formData.description);
      fd.append("category", formData.category);
      fd.append("subcategory", formData.subcategory);
      fd.append("rating", String(formData.rating));
      fd.append("inStock", String(formData.inStock));
      fd.append("tags", JSON.stringify(formData.tags));

      if (formData.productVideo instanceof File) {
        fd.append("productVideo", formData.productVideo);
      } else {
        fd.append("productVideo", formData.productVideo || "");
      }

      if (newImages.length > 0) {
        newImages.forEach((file) => fd.append("images", file));
      } else {
        fd.append("existingImages", JSON.stringify(existingImages));
      }

      const response = await axios.patch(`${API_URL}/api/productinfo/${id}/details`, fd, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSuccess(true);
      toast.success("Details updated successfully!");
    } catch (err) {
      const msg = err?.response?.data?.message || "Update failed";
      setError(msg);
      console.error("Update Error:", err?.response?.data);
    } finally {
      setLoading(false);
    }
  };

  if (isFetching) {
    return <div className="page-container"><p>Loading product details...</p></div>;
  }

  return (
    <div className="page-container">
      <div className="add-product">
        <BackButton to="/my-products" />
        <h2>Update Product Details</h2>

        <div className="product-form">
          <div className="form-col">
            <label>Product Name *</label>
            <input name="name" value={formData.name} onChange={handleChange} />
          </div>

          <div className="form-col">
            <label>Product Description *</label>

            {/* Using your big-textarea class to act as the border/box */}
            <div className="big-textarea mdx-input-wrapper">
              <MDXEditor
                markdown={formData.description || ""}
                onChange={(value) => {
                  setFormData((prev) => ({
                    ...prev,
                    description: value,
                  }));
                }}
                plugins={[
                  headingsPlugin(),
                  listsPlugin(),
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
                contentEditableClassName="clean-editor-content"
                className="mdx-inner-editor"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-col">
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
                  setFormData((prev) => ({
                    ...prev,
                    category: selected ? selected.value : "",
                    subcategory: "",
                  }))
                }
                placeholder="Select or type a category"
                styles={customSelectStyles}
              />
            </div>

            <div className="form-col">
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
                  setFormData((prev) => ({
                    ...prev,
                    subcategory: selected ? selected.value : "",
                  }))
                }
                placeholder="Select or type a subcategory"
                styles={customSelectStyles}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-col">
              <label>Tags *</label>
              <CreatableSelect
                isMulti
                name="tags"
                options={tagOptions}
                value={formData.tags.map((tag) => ({
                  value: tag,
                  label: tag,
                }))}
                onChange={(selectedOptions) => {
                  setFormData({
                    ...formData,
                    tags: selectedOptions ? selectedOptions.map((opt) => opt.value) : [],
                  });
                }}
                placeholder="Select or type to create new tags"
                styles={customSelectStyles}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-col">
              <label>Rating (1–5) *</label>
              <input type="number" min="1" max="5" name="rating" value={formData.rating} onChange={handleChange} />
            </div>

            <div className="form-col">
              <label>In Stock *</label>
              <input type="number" name="inStock" value={formData.inStock} onChange={handleChange} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-col">
              <label>Product Images (Max 5) *</label>
              <input
                type="file"
                name="images"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                onChange={handleImageChange}
              />
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "10px" }}>
                {existingImages.map((url, index) => (
                  <div key={`existing-${index}`} style={{ position: "relative", width: "fit-content" }}>
                    <img
                      src={url}
                      alt={`Product ${index + 1}`}
                      width="100"
                      height="100"
                      style={{ objectFit: "cover", borderRadius: "8px", border: "1px solid #e5e7eb" }}
                    />
                    <button
                      type="button"
                      style={{
                        position: "absolute",
                        top: "-8px",
                        right: "-8px",
                        background: "#ff4d4d",
                        color: "white",
                        border: "none",
                        borderRadius: "50%",
                        width: "22px",
                        height: "22px",
                        cursor: "pointer",
                      }}
                      onClick={() => removeExistingImage(index)}
                    >
                      &times;
                    </button>
                  </div>
                ))}
                {newImagePreviews.map((url, index) => (
                  <div key={`new-${index}`} style={{ position: "relative", width: "fit-content" }}>
                    <img
                      src={url}
                      alt={`New ${index + 1}`}
                      width="100"
                      height="100"
                      style={{ objectFit: "cover", borderRadius: "8px", border: "1px solid #e5e7eb" }}
                    />
                    <button
                      type="button"
                      style={{
                        position: "absolute",
                        top: "-8px",
                        right: "-8px",
                        background: "#ff4d4d",
                        color: "white",
                        border: "none",
                        borderRadius: "50%",
                        width: "22px",
                        height: "22px",
                        cursor: "pointer",
                      }}
                      onClick={() => removeNewImage(index)}
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-col">
              <label>Product Video (Max 20MB)</label>
              <input
                type="file"
                name="productVideo"
                accept="video/mp4,video/webm,video/quicktime"
                onChange={handleVideoChange}
              />
              {videoPreview && (
                <div className="video-preview-container" style={{ marginTop: "10px", position: "relative", width: "fit-content" }}>
                  <video src={videoPreview} controls width="250" style={{ borderRadius: '8px' }} />
                  <button
                    type="button"
                    className="remove-video-btn"
                    style={{
                      position: "absolute",
                      top: "-10px",
                      right: "-10px",
                      background: "#ff4d4d",
                      color: "white",
                      border: "none",
                      borderRadius: "50%",
                      width: "24px",
                      height: "24px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "16px",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
                    }}
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
        </div>

        {error && <p className="error-text" style={{ color: "red", marginTop: "10px" }}>❌ {error}</p>}
        {success && (
          <div className="success-box">
            <p>Product updated successfully</p>
            <button
              className="continue-btn"
              onClick={() => navigate(`/products/${id}/update-prices`)}
            >
              Continue
            </button>
          </div>
        )}
        {!success && (<div className="action-buttons">
          <button className="skip-btn" onClick={() => navigate(`/products/${id}/update-prices`)}>Skip</button>
          <button className="cancel-btn" onClick={() => navigate("/my-products")}>Cancel</button>
          <button className="save-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Save & Update"}
          </button>
        </div>)}
      </div>
    </div>
  );
}
