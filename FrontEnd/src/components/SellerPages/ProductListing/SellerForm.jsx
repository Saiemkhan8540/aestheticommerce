import React, { useState } from "react";
import ProductForm from "./ProductForm";

export default function SellerForm() {
  const [sellerName, setSellerName] = useState("");
  const [occupation, setOccupation] = useState("");
  const [storeName, setStoreName] = useState("");
  const [products, setProducts] = useState([]);

  const handleAddProduct = () => {
    const newProduct = {
      localId: Date.now(), // unique for React key
      name: "",
      description: "",
      price: "",
      originalPrice: "",
      discountPercentage: "",
      category: "",
      subcategory: "",
      image: null,
    };
    setProducts([...products, newProduct]);
  };

  const handleProductChange = (index, updatedProduct) => {
    const updatedProducts = [...products];
    updatedProducts[index] = updatedProduct;
    setProducts(updatedProducts);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();

    formData.append("sellerName", sellerName);
    formData.append("occupation", occupation);
    formData.append("storeName", storeName);

    // Include all fields except image for text data
    const newProduct = {
  localId: Date.now(),
  name: "",
  description: "",
  price: "",
  originalPrice: "",
  discountPercentage: "",
  category: "",
  subcategory: "",
  tags: [], // added
  image: null,
};

const productsWithoutImages = products.map(
  ({
    name,
    description,
    price,
    originalPrice,
    discountPercentage,
    category,
    subcategory,
    tags, // added
  }) => ({
    name,
    description,
    price: price !== "" ? Number(price) : 0,
    originalPrice: originalPrice !== "" ? Number(originalPrice) : null,
    discountPercentage: discountPercentage !== "" ? Number(discountPercentage) : null,
    category,
    subcategory,
    tags, // include
  })
);
    formData.append("products", JSON.stringify(productsWithoutImages));

    // Append each product image file
    products.forEach((prod) => {
      formData.append("images", prod.image);
    });

    fetch("http://localhost:5000/seller/uploadSellerProducts", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        alert("Seller data submitted!");
      })
      .catch((err) => console.error(err));
  };

  return (
    <form onSubmit={handleSubmit} className="seller_form-card">
      <h2 className="seller_form-heading">Seller Details</h2>

      <input
        className="seller_form-input"
        type="text"
        placeholder="Enter your name"
        value={sellerName}
        onChange={(e) => setSellerName(e.target.value)}
        required
      />

      <input
        className="seller_form-input"
        type="text"
        placeholder="Occupation"
        value={occupation}
        onChange={(e) => setOccupation(e.target.value)}
        required
      />

      <input
        className="seller_form-input"
        type="text"
        placeholder="Enter store name"
        value={storeName}
        onChange={(e) => setStoreName(e.target.value)}
        required
      />

      <button
        type="button"
        onClick={handleAddProduct}
        className="seller_form-button"
      >
        Add Product
      </button>

      {products.map((product, index) => (
        <ProductForm
          key={product.localId}
          index={index}
          product={product}
          onChange={handleProductChange}
        />
      ))}

      <button type="submit" className="seller_form-button">
        Submit Listing
      </button>
    </form>
  );
}
