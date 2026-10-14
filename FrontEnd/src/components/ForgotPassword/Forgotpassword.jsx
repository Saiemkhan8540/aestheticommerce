import React from 'react'
import './forgotpassword.css'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ForgotPassword } from '../../Redux/authSlice';
import { useEffect } from 'react';

const Forgotpassword = () => {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");

    const [isSubmitted, setIsSubmitted] = useState(false);

    const { user, loading, error } = useSelector((state) => state.user);

    // console.log("ForgotPassword Component Rendered with user:- ", user, " | Loading:- ", loading, " | Error:- ", error);

    const handleSubmit = (e) => {
        e.preventDefault();

        setIsSubmitted(true);

        dispatch(ForgotPassword({ email }));
    };

    // 3. Redirect Logic
    useEffect(() => {
        const expiry = user?.forgot_password_expiry
            ? new Date(user.forgot_password_expiry).getTime()
            : 0;
        // console.log("Checking redirect conditions in ForgotPassword useEffect:- ", user, " | Expiry:- ", expiry, " | Current Time:- ", Date.now(), " | IsSubmitted:- ", isSubmitted);

        if (user && expiry > Date.now() && isSubmitted) {

            navigate('/verification-otp', {
                state: { email: email }
            });

            setIsSubmitted(false);
        }
    }, [user, navigate, email, isSubmitted]); // Added isSubmitted to dependencies

    return (
        <div className='forgotPassword-background'>
            <div className='forgotPassword-container'>
                <h2>Forgot Password</h2>
                {loading && <p className='forgotPassword-loading'>Loading...</p>}
                <form onSubmit={handleSubmit}>
                    <label>Email</label>
                    <input
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        type='email'
                        placeholder='Enter your email'
                    />

                    <button type='submit' disabled={loading}>Send OTP</button>
                </form>

                {error && <p className="error-msg">{error}</p>}

                <p>
                    Don’t have an account? <Link to={"/register"}>Register</Link>
                </p>
            </div>
        </div>
    )
}

export default Forgotpassword