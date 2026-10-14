import react from "react";
import Navbar from "../src/components/Navbar/Navbar";
import Cart from "../src/components/CartSec/Cart";
import Footersec from '../src/components/Footersection/Footersection.jsx';

const Cartpage = () => {
    return (
        <div>
        <Navbar />
        <Cart />
        <Footersec />
        </div>
    );
    }
export default Cartpage;