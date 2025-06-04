import { useState, useContext } from "react";
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

import Logo from '../assets/images/Logo_Big_Without_Backgorund.svg';

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`http://${import.meta.env.VITE_APP_BACKEND_IP}:5000/api/auth/login`, { email, password });
            login(res.data.token);
            navigate('/dashboard');
        } catch (err) {
            alert(err.response?.data?.message || "Login failed");
        }
    };

    return (
        <div>
            <div>
                <div>
                    <img src={Logo} alt="Logo" />
                </div>
                <div>
                    <form onSubmit={handleSubmit}>
                        <h2>Login</h2>
                        <div>
                            <input type="email" onChange={e => setEmail(e.target.value)} placeholder="Email" required />
                        </div>
                        <div>
                            <input type="password" onChange={e => setPassword(e.target.value)} placeholder="Password" required />
                        </div>
                        <button type="submit">Login</button>
                        <p>Don't have an account? <Link to="/register">Register</Link></p>
                    </form>
                </div>
            </div>
        </div>
    );
}