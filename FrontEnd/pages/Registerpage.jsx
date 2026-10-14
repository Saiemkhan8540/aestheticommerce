import React from 'react';

import Register from '../src/components/RegisterSection/Registersection.jsx';
import SEO from '../src/utils/SEO.jsx';


function Registerpage() {
    return (
        <>
        <SEO
        title="Register | Aestheticommerce"
        description="Register to your Aestheticommerce account to manage orders, favorites and more."
        url={`${import.meta.env.VITE_APP_URL}/register`}

        />
        <div>
            <Register></Register>
            
            
        </div>
        </>
    );
}


export default Registerpage;