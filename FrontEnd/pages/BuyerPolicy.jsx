import Navbar from "../src/components/Navbar/Navbar";
import Footersection from "../src/components/Footersection/Footersection";
import BuyerPolicyComponent from "../src/components/BuyerPolicyComponent/BuyerPolicyComponent";
import PolicySelector from "./PoliciesSelector/PolicySelector";


function BuyerPolicy() {
  return (
    <div>
      <Navbar />
      <PolicySelector />
      <BuyerPolicyComponent />
      <Footersection />
    </div>
  )
};
export default BuyerPolicy;
