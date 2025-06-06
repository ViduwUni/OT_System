import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

import Logo from '../assets/images/Logo.png';

export default function Register() {
    const containerRef = useRef(null);
    const inputRefs = useRef([]);
    const logoRef = useRef(null);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "supervisor(hr)"
    });

    useEffect(() => {
        // Animate container
        gsap.from(containerRef.current, {
            opacity: 0,
            scale: 0.9,
            duration: 0.8,
            ease: "power2.out"
        });

        // Animate form inputs (staggered)
        if (inputRefs.current.length > 0) {
            gsap.from(inputRefs.current, {
                y: 40,
                opacity: 0,
                duration: 0.6,
                stagger: 0.1,
                delay: 0.4,
                ease: "power2.out"
            });
        }

        // Animate logo
        gsap.from(logoRef.current, {
            x: 100,
            opacity: 0,
            duration: 0.8,
            ease: "power2.out"
        });
    }, []);

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await axios.post(`http://${import.meta.env.VITE_APP_BACKEND_IP}:5000/api/auth/register`, formData);
            alert("Registered successfully! Please login.");
            navigate("/");
        } catch (err) {
            alert(err.response?.data?.message || "Registration failed.");
        }
    };

    return (
        <section className="bg-[#F4F7FA] min-h-screen flex items-center justify-center">
            <div ref={containerRef} className="bg-[#7AB2D3] flex rounded-2xl shadow-lg max-w-3xl p-5">
                <div className="w-1/2 px-8">
                    <h2
                        ref={el => inputRefs.current[0] = el}
                        className="font-bold text-3xl flex justify-center text-[#183A57]"
                    >
                        Register
                    </h2>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
                        <input
                            ref={el => inputRefs.current[1] = el}
                            type="text"
                            name="name"
                            placeholder="Name"
                            onChange={handleChange}
                            className="p-2 rounded-xl border border-[#4A628A]"
                        />
                        <input
                            ref={el => inputRefs.current[2] = el}
                            type="email"
                            name="email"
                            placeholder="Email"
                            onChange={handleChange}
                            className="p-2 rounded-xl border border-[#4A628A]"
                        />
                        <input
                            ref={el => inputRefs.current[3] = el}
                            type="password"
                            name="password"
                            placeholder="Password"
                            onChange={handleChange}
                            className="p-2 rounded-xl border border-[#4A628A]"
                        />
                        <select
                            ref={el => inputRefs.current[4] = el}
                            name="role"
                            onChange={handleChange}
                            className="p-2 rounded-xl border border-[#4A628A] bg-white"
                        >
                            <option value="">Select a Role</option>
                            <option value="manager(hr)">Manager (HR)</option>
                            <option value="supervisor(hr)">Supervisor (HR)</option>
                            <option value="manager(production)">Manager (Production)</option>
                            <option value="supervisor(production)">Supervisor (Production)</option>
                        </select>
                        <button
                            ref={el => inputRefs.current[5] = el}
                            type="submit"
                            className="bg-[#183A57] text-white py-2 rounded-xl hover:bg-[#4A628A]"
                        >
                            Register
                        </button>
                        <p
                            ref={el => inputRefs.current[6] = el}
                            className="text-[#1A1A1A] text-center"
                        >
                            Have an account? <Link to="/" className="underline text-[#183A57]">Login</Link>
                        </p>
                    </form>
                </div>

                <div className="w-1/2 flex justify-center items-center">
                    <img
                        ref={logoRef}
                        src={Logo}
                        alt="logo"
                        className="rounded-2xl max-w-full"
                    />
                </div>
            </div>
        </section>
    );
}