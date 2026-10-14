import Navbar from "../src/components/Navbar/Navbar";
import Footersection from "../src/components/Footersection/Footersection";
import PrivacyAddendumComponent from "../src/components/PrivacyAddendum/PrivacyAddendumComponent";
import PolicySelector from "./PoliciesSelector/PolicySelector";
function PrivacyAddendum() {
  return (
    <div>
      <Navbar />
      <PolicySelector/>
      <PrivacyAddendumComponent />
      <Footersection />
    </div>
  );
};
export default PrivacyAddendum;
