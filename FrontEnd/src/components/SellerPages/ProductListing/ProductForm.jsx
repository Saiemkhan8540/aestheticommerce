import React from "react";
import Select from "react-select";

export default function ProductForm({ index, product, onChange }) {
  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    const updatedProduct = {
      ...product,
      [name]: files ? files[0] : value,
    };
    onChange(index, updatedProduct);
  };

  const handleTagsChange = (selectedOptions) => {
    const updatedProduct = {
      ...product,
      tags: selectedOptions ? selectedOptions.map((opt) => opt.value) : [],
    };
    onChange(index, updatedProduct);
  };

  // Example predefined tag options
  const tagOptions = [
    { value: "diy", label: "DIY" },
    { value: "paper", label: "Paper" },
    { value: "origami", label: "Origami" },
    { value: "creative", label: "Creative" },
    { value: "paper crafts", label: "Paper Crafts" },
    { value: "Valentine Gift", label: "Valentine Gift" },
    { value: "House Party", label: "House Party" },
    { value: "Dinner Dates", label: "Dinner Dates" },
    { value: "Baby Shower", label: "Baby Shower" },
    { value: "Anniversaries", label: "Anniversaries" },
    { value: "Diwali Lights", label: "Diwali Lights" },
    { value: "Eid", label: "Eid" },
    { value: "Christmas Eve", label: "Christmas Eve" },
  ];

  return (
    <div className="seller_product-card">
      <input
        className="seller_product-input"
        type="text"
        name="name"
        placeholder="Product Name"
        value={product.name}
        onChange={handleInputChange}
        required
      />

      <input
        className="seller_product-input"
        type="text"
        name="description"
        placeholder="Description"
        value={product.description}
        onChange={handleInputChange}
        required
      />

      <input
        className="seller_product-input"
        type="number"
        name="price"
        placeholder="Price (₹)"
        value={product.price}
        onChange={handleInputChange}
        required
        min="0"
        step="0.01"
      />

      <input
        className="seller_product-input"
        type="number"
        name="originalPrice"
        placeholder="Original Price (₹)"
        value={product.originalPrice}
        onChange={handleInputChange}
        required
        min="0"
        step="0.01"
      />

      <input
        className="seller_product-input"
        type="number"
        name="discountPercentage"
        placeholder="Discount Percentage (%)"
        value={product.discountPercentage}
        onChange={handleInputChange}
        required
        min="0"
        step="0.01"
      />

      <input
        className="seller_product-input"
        type="text"
        name="category"
        placeholder="Category"
        value={product.category}
        onChange={handleInputChange}
        required
      />

      <input
        className="seller_product-input"
        type="text"
        name="subcategory"
        placeholder="Subcategory"
        value={product.subcategory}
        onChange={handleInputChange}
        required
      />

      <Select
        isMulti
        name="tags"
        options={tagOptions}
        className="seller_product-select"
        classNamePrefix="select"
        placeholder="Select or add tags"
        onChange={handleTagsChange}
        value={product.tags ? product.tags.map(tag => ({ value: tag, label: tag })) : []}
      />

      <input
        className="seller_product-file"
        type="file"
        name="image"
        accept="image/*"
        onChange={handleInputChange}
        required
      />
    </div>
  );
}
