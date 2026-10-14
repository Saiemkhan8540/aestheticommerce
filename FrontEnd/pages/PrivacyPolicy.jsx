import PrivacyPolicyComponent from "../src/components/PrivacyPolicySection/PrivacyPolicyComponent";
import Navbar from "../src/components/Navbar/Navbar";
import Footersection from "../src/components/Footersection/Footersection";
import PolicySelector from "./PoliciesSelector/PolicySelector";

function PrivacyPolicy() {
  return (
    <div>
      <Navbar />
      <PolicySelector/>
      <PrivacyPolicyComponent />
      <Footersection />
    </div>

  )
}
export default PrivacyPolicy;
