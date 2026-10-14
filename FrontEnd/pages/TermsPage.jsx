import TermsOfUseComponent from "../src/components/TermsOfUse/TermsComponent";
import Navbar from "../src/components/Navbar/Navbar";
import Footersection from "../src/components/Footersection/Footersection";
import PolicySelector from "./PoliciesSelector/PolicySelector";
function TermsOfUse() {
  return (
    <div>
      <Navbar />
      <PolicySelector/>
      <TermsOfUseComponent />
      <Footersection />
    </div>
  )
}
export default TermsOfUse;
