import React from "react";
import SellerForm from "./ProductListing/SellerForm";
import "./Handler.css"; // Assuming you have some styles for the handler

function SellerHandler() {
  return (
    <div className="seller_handler-container">
      <h1 className="seller_handler-heading">Welcome to Astheticommerce!</h1>
      <h3 className="seller_handler-subheading">
        Dear Seller. Welcome to our Seller Listing Page.
      </h3>
      <SellerForm />
    </div>
  );
}

export default SellerHandler;
