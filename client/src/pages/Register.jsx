import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

import Logo from '../assets/images/Logo.png';

export default function Register() {
    const containerRef = useRef(null);
    const inputRefs = useRef([]);
    const logoRef = useRef(null);
    const buttonRef = useRef(null);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "supervisor(hr)"
    });

    // Helper for refs array
    const setRef = (index) => (el) => {
        inputRefs.current[index] = el;
    };

    useEffect(() => {
        // Animate container scale & fade in
        gsap.fromTo(
            containerRef.current,
            { scale: 0.8, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.7, ease: "power3.out" }
        );

        // Animate logo sliding from right
        gsap.fromTo(
            logoRef.current,
            { x: 100, opacity: 0 },
            { x: 0, opacity: 1, duration: 1, ease: "power3.out", delay: 0.3 }
        );

        // Animate inputs scale & fade staggered
        gsap.fromTo(
            inputRefs.current,
            { scale: 0.9, opacity: 0, y: 40 },
            {
                scale: 1,
                opacity: 1,
                y: 0,
                duration: 0.5,
                stagger: 0.15,
                ease: "back.out(1.7)",
                delay: 0.6
            }
        );

        // Animate register button scale & fade in, ensure on top
        if (buttonRef.current) {
            gsap.fromTo(
                buttonRef.current,
                { scale: 0.8, opacity: 0 },
                {
                    scale: 1,
                    opacity: 1,
                    duration: 0.5,
                    ease: "back.out(1.7)",
                    delay: 1.2,
                    onStart: () => {
                        buttonRef.current.style.zIndex = 10;
                    }
                }
            );
        }
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
        <section className="bg-[#F4F7FA] min-h-screen flex items-center justify-center px-4">
            <div
                ref={containerRef}
                className="bg-white flex rounded-2xl shadow-lg max-w-3xl p-5 border border-black overflow-visible"
            >
                <div className="w-1/2 px-8">
                    <h2
                        ref={setRef(0)}
                        className="font-bold text-3xl flex justify-center text-[#183A57]"
                    >
                        Register
                    </h2>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
                        <input
                            ref={setRef(1)}
                            type="text"
                            name="name"
                            placeholder="Name"
                            onChange={handleChange}
                            className="p-2 rounded-xl border border-[#4A628A]"
                            required
                        />
                        <input
                            ref={setRef(2)}
                            type="email"
                            name="email"
                            placeholder="Email"
                            onChange={handleChange}
                            className="p-2 rounded-xl border border-[#4A628A]"
                            required
                        />
                        <input
                            ref={setRef(3)}
                            type="password"
                            name="password"
                            placeholder="Password"
                            onChange={handleChange}
                            className="p-2 rounded-xl border border-[#4A628A]"
                            required
                        />
                        <select
                            ref={setRef(4)}
                            name="role"
                            onChange={handleChange}
                            className="p-2 rounded-xl border border-[#4A628A] bg-white"
                            defaultValue="supervisor(hr)"
                        >
                            <option value="">Select a Role</option>
                            <option value="manager(hr)">Manager (HR)</option>
                            <option value="supervisor(hr)">Supervisor (HR)</option>
                            <option value="manager(production)">Manager (Production)</option>
                            <option value="supervisor(production)">Supervisor (Production)</option>
                        </select>
                        <button
                            ref={buttonRef}
                            type="submit"
                            className="bg-[#183A57] text-white py-2 rounded-xl hover:bg-[#4A628A] relative z-10"
                        >
                            Register
                        </button>
                        <p
                            ref={setRef(5)}
                            className="text-[#1A1A1A] text-center"
                        >
                            Have an account?{" "}
                            <Link to="/" className="underline text-[#183A57]">
                                Login
                            </Link>
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