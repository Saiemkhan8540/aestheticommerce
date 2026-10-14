import Navbar from "../src/components/Navbar/Navbar";
import Footersection from "../src/components/Footersection/Footersection";
import SellerPolicyComponent from "../src/components/SellerPolicy/SellerPolicyComponent"
import PolicySelector from "./PoliciesSelector/PolicySelector";
function SellerPolicy() {
  return (
    <div>
      <Navbar />
      <PolicySelector />
      <SellerPolicyComponent />
      <Footersection />
    </div>

  );
};

export default SellerPolicy;
