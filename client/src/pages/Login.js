import { useState, useContext } from "react";
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

import './css/Login.css';
import Logo from '../includes/images/Logo_Big_Without_Backgorund.svg';

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`http://${process.env.REACT_APP_BACKEND_IP}:5000/api/auth/login`, { email, password });
            login(res.data.token);
            navigate('/dashboard');
        } catch (err) {
            alert(err.response?.data?.message || "Login failed");
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-left">
                    <img src={Logo} alt="Logo" className="login-logo" />
                </div>
                <div className="login-right">
                    <form onSubmit={handleSubmit} className="login-form">
                        <h2>Login</h2>
                        <div className="input-group">
                            <input type="email" onChange={e => setEmail(e.target.value)} placeholder="Email" required />
                        </div>
                        <div className="input-group">
                            <input type="password" onChange={e => setPassword(e.target.value)} placeholder="Password" required />
                        </div>
                        <button type="submit">Login</button>
                        <p className="register-link">Don't have an account? <Link to="/register">Register</Link></p>
                    </form>
                </div>
            </div>
        </div>
    );
}