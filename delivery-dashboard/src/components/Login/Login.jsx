import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginDelivery, clearError } from "../../Redux/authSlice";
import "./Login.css";
import logo from "../../Images/Asset9.png";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { error, loading } = useSelector((state) => state.auth);

    React.useEffect(() => {
        const token = localStorage.getItem("deliveryToken");

        if (token) {
            dispatch(verifyToken());
        }
    }, [dispatch]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            return;
        }

        const result = await dispatch(loginDelivery({ email, password }));
        if (loginDelivery.fulfilled.match(result)) {
            navigate("/");
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-container">
                <div className="login-logo-container">
                    <img src={logo} alt="Aestheticommerce" className="login-logo" />
                </div>

                <h2 className="login-title">Delivery Partner Login</h2>
                {error && <p className="login-error">{error}</p>}

                <form onSubmit={handleSubmit}>
                    <div className="login-input-group">
                        <label className="login-label">Email</label>
                        <input
                            type="email"
                            className="login-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                        />
                    </div>

                    <div className="login-input-group">
                        <label className="login-label">Password</label>
                        <input
                            type="password"
                            className="login-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                        />
                    </div>

                    <button type="submit" className="login-button" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <p className="login-register-text">
                    New Delivery Partner?{" "}
                    <span
                        className="login-register-link"
                        style={{ cursor: "pointer" }}
                        onClick={() => navigate("/register")}
                    >
                        Register here
                    </span>
                </p>
            </div>
        </div>
    );
};

export default Login;
