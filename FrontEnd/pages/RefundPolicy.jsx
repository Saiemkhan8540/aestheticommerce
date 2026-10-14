import React from "react";
import Navbar from "../src/components/Navbar/Navbar";
import Footersection from "../src/components/Footersection/Footersection";
import RefundPolicy from "../src/components/RefundPolicy/refundPolicy";
import PolicySelector from "./PoliciesSelector/PolicySelector";
function RefundPolicies() {
  return (
    <div>
      <Navbar />
      <PolicySelector />
      <RefundPolicy />
      <Footersection />
    </div>
  );
}
export default RefundPolicies;
