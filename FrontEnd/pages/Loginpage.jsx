import React from 'react';
import Login from '../src/components/LoginSection/Loginsection.jsx';
import SEO from '../src/utils/SEO.jsx';


function Loginpage() {
    return (
        <>
        <SEO
         title="Login | Aestheticommerce"
         description="Login to your Aestheticommerce account to manage orders, favorites and more."
         url={`${import.meta.env.VITE_APP_URL}/login`}
        />
        <div>
            <Login></Login>
            
            
        </div>
        </>
    );
}


export default Loginpage;