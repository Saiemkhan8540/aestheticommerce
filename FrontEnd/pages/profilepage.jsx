import React from "react";
import Navbar from "../src/components/Navbar/Navbar";
import Profilesec from "../src/components/ProfileSec/profilesec";
import Footersec from '../src/components/Footersection/Footersection.jsx';





const Profile =()=> {
  return (
    <div>
        <Navbar />
        <Profilesec />
        <Footersec />
    
    </div>
  );
};

export default Profile;