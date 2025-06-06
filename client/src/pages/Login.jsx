import { useState, useEffect, useRef, useContext } from 'react';
import gsap from 'gsap';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

import Logo from '../assets/images/Logo.png';

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const containerRef = useRef(null);
    const inputRefs = useRef([]);
    const logoRef = useRef(null);

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
        <section className="bg-[#F4F7FA] min-h-screen flex items-center justify-center">
            {/* Login Container */}
            <div ref={containerRef} className="bg-[#7AB2D3] flex rounded-2xl shadow-lg max-w-3xl p-5">
                <div className="w-1/2 px-16">
                    <h2 ref={el => inputRefs.current[0] = el} className="font-bold text-3xl mt-10 flex items-center justify-center text-[#183A57]">
                        Login
                    </h2>

                    <form onSubmit={handleSubmit} className="gap-4 flex flex-col items-center">
                        <input
                            ref={el => inputRefs.current[1] = el}
                            className="p-2 mt-8 rounded-xl border w-full border-[#4A628A] text-[#1A1A1A]"
                            type="email"
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                            required
                        />
                        <input
                            ref={el => inputRefs.current[2] = el}
                            className="p-2 rounded-xl border w-full border-[#4A628A] text-[#1A1A1A]"
                            type="password"
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            required
                        />
                        <button
                            ref={el => inputRefs.current[3] = el}
                            className="bg-[#183A57] hover:bg-[#4A628A] rounded-xl text-white py-2 w-full transition duration-300"
                            type="submit"
                        >
                            Login
                        </button>
                        <p ref={el => inputRefs.current[4] = el} className="text-[#1A1A1A]">
                            Don't have an account?{" "}
                            <Link className="underline text-[#183A57]" to="/register">
                                Register
                            </Link>
                        </p>
                    </form>
                </div>
                <div className="w-1/2">
                    <img ref={logoRef} className="rounded-2xl" src={Logo} alt="icon preview" />
                </div>
            </div>
        </section>
    );
}