import React from "react";
import Navbar from "../src/components/Navbar/Navbar";
import AboutSection from "../src/components/About/about";
import Footersec from "../src/components/Footersection/Footersection";

function About(){
 return(
     <div>
        <Navbar/>
        <AboutSection/>
        <Footersec/>
     </div>
 );
}
export default About;