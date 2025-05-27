import "./LoginPanel.css";
import { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = "http://localhost:5000/login";
const REGISTER_URL = "http://localhost:5000/register";



const LoginPanel = ({ onLogin }) => {
    const [formData, setFormData] = useState({ 
        email: '', 
        password: '',
        firstName: '',
        lastName: ''
    });
    const [error, setError] = useState("");
    const [isLogin, setIsLogin] = useState(true);
    const [isAnimating, setIsAnimating] = useState(false);
    

    const tabForm = (loginState) => {
        if (isLogin !== loginState) {
            setIsAnimating(true);
            setTimeout(() => {
                setIsLogin(loginState);
                setIsAnimating(false);
            }, 200); // Match this to your CSS transition time
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const url = isLogin ? API_URL : REGISTER_URL;
            // Only send relevant data based on form type
            const dataToSend = isLogin
                ? { email: formData.email, password: formData.password }
                : formData;
                
            const response = await axios.post(url, dataToSend);
            
            if (response.data.success) {
                toast.success(`${isLogin ? "Login" : "Registration"} successful!`);
                
                if (!isLogin) {
                    tabForm(true);
                    setFormData({ email: '', password: '', firstName: '', lastName: '' });
                } else {
                    const { user, token } = response.data;
                    localStorage.setItem('user', JSON.stringify(user));
                    if (token) {
                        localStorage.setItem('token', token);
                    }
                    onLogin(user, token);
                }
            } else {
                setError(response.data.message || "Invalid email or password.");
                toast.error(response.data.message || `${isLogin ? "Login" : "Registration"} failed.`);
            }
        } catch (error) {
            console.error(error);
            const errorMessage = error.response?.data?.message || 
                               "Error connecting to server or invalid credentials.";
            setError(errorMessage);
            toast.error(errorMessage);
        }
    };

    return (
    <div className="login-bg-wrapper">
        {/* Header with Logo and Title */}
        <div className="login-header">
            <img
                src="/images/brgy_bonbonon.jpg"
                alt="Brgy. Bonbonon Logo"
                className="login-header-logo"
            />
            <span className="login-header-title">
                Brgy. Bonbonon Profiling System
            </span>
        </div>

        <div
            className="login-container"
            style={{
                backgroundImage: "url('/images/dodiongan-falls.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                position: "relative"
            }}
        >
            <ToastContainer />
            <form onSubmit={handleSubmit} className={`login-form ${isAnimating ? 'fade-out' : 'fade-in'}`}>
                {/* tab Button UI */}
                <div className="form-tab">
                    <button 
                        type="button"
                        className={`tab-btn ${isLogin ? 'active' : ''}`} 
                        onClick={() => tabForm(true)}
                        disabled={isAnimating}
                    >
                        Login
                    </button>
                    <button 
                        type="button"
                        className={`tab-btn ${!isLogin ? 'active' : ''}`} 
                        onClick={() => tabForm(false)}
                        disabled={isAnimating}
                    >
                        Register
                    </button>
                </div>
                
                <div className="form-fields-container">
                    {/* First Name field - only shown when registering */}
                    {!isLogin && (
                        <div className="form-group sliding-field">
                            <label htmlFor="firstName">First Name:</label>
                            <input
                                type="text"
                                id="firstName"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                required
                                placeholder="Enter your first name"
                            />
                        </div>
                    )}
                    
                    {/* Last Name field - only shown when registering */}
                    {!isLogin && (
                        <div className="form-group sliding-field">
                            <label htmlFor="lastName">Last Name:</label>
                            <input
                                type="text"
                                id="lastName"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                required
                                placeholder="Enter your last name"
                            />
                        </div>
                    )}
                    
                    <div className="form-group">
                        <label htmlFor="email">Email:</label>
                        <input
                            type="email"
                            id="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            placeholder="Enter your email"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password:</label>
                        <input
                            type="password"
                            id="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                            placeholder="Enter your password"
                        />
                    </div>
                </div>

                {error && <div className="error-message">{error}</div>}
                
                <button type="submit" className="submit-button">
                    {isLogin ? "Login" : "Register"}
                </button>
            </form>
        </div>
    </div>
);
};

export default LoginPanel;