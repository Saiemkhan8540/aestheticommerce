// SellerProfilePage.jsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSellerProfile } from "../src/Redux/sellerSlice"; 
import SellerProfile from "../src/components/SellerProfile/SellerProfile";

const SellerProfilePage = () => {
  const dispatch = useDispatch();
  const { profile, loading, error } = useSelector((state) => state.seller);

  useEffect(() => {
    // Only fetch if profile doesn't exist
    if (!profile) {
      dispatch(fetchSellerProfile());
    }
  }, [dispatch, profile]);

  return (
    <div>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : profile ? (
        <SellerProfile /> 
      ) : (
        <p>No seller data found. Please login.</p>
      )}
    </div>
  );
};

export default SellerProfilePage;