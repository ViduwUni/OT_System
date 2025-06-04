import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "supervisor(hr)" // default role
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.email || !formData.password) {
            alert("All fields are required");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            alert("Invalid email format");
            return;
        }

        if (formData.password.length < 6) {
            alert("Password must be at least 6 characters");
            return;
        }

        try {
            await axios.post(`http://${import.meta.env.VITE_APP_BACKEND_IP}:5000/api/auth/register`, formData);
            alert("Registered successfully! Please login.");
            navigate("/");
        } catch (err) {
            alert(err.response?.data?.message || "Registration failed.");
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <input type="text" name="name" placeholder="Name" onChange={handleChange} required />
                <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
                <input type="password" name="password" placeholder="Password" onChange={handleChange} required />

                <select name="role" onChange={handleChange}>
                    <option value="">Select a Role</option>
                    <option value="manager(hr)">Manager (HR)</option>
                    <option value="supervisor(hr)">Supervisor (HR)</option>
                    <option value="manager(production)">Manager (Production)</option>
                    <option value="supervisor(production)">Supervisor (Production)</option>
                </select>

                <button type="submit">Register</button>
            </form>

            <p>Have an account? <Link to="/">Login</Link></p>
        </div>
    );
}