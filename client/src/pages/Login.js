import { useState, useContext } from "react";
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

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
            alert(err.response.data.message);
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <input type="email" onChange={e => setEmail(e.target.value)} placeholder="Email" />
                <input type="password" onChange={e => setPassword(e.target.value)} placeholder="Password" />
                <button type="submit">Login</button>
            </form>
            <p>Don't have an account? <Link to="/register">Register</Link></p>
        </div>
    );
}