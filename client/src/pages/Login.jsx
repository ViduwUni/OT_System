import { useState, useEffect, useRef, useContext } from "react";
import gsap from "gsap";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import ContactForm from "../components/ContactForm";

import Logo from "../assets/images/Logo.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const containerRef = useRef(null);
  const inputRefs = useRef([]);
  const logoRef = useRef(null);
  const buttonRef = useRef(null);

  const setRef = (index) => (el) => {
    inputRefs.current[index] = el;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    try {
      const res = await axios.post(
        `http://${import.meta.env.VITE_APP_BACKEND_IP}:5000/api/auth/login`,
        { email, password }
      );
      login(res.data.token);
      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  useEffect(() => {
    // Auto-fill credentials
    setEmail("demo@demo.com");
    setPassword("demopassword");
  }, []);

  useEffect(() => {
    if (email === "demo@demo.com" && password === "demopassword") {
      const timer = setTimeout(() => {
        handleSubmit({ preventDefault: () => {} });
      }, 600); // slight delay after setting state
      return () => clearTimeout(timer);
    }
  }, [email, password]);

  useEffect(() => {
    gsap.fromTo(
      containerRef.current,
      { scale: 0.8, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.7, ease: "power3.out" }
    );

    gsap.fromTo(
      logoRef.current,
      { x: 100, opacity: 0 },
      { x: 0, opacity: 1, duration: 1, ease: "power3.out", delay: 0.3 }
    );

    gsap.fromTo(
      inputRefs.current,
      { scale: 0.9, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        duration: 0.5,
        stagger: 0.15,
        ease: "back.out(1.7)",
        delay: 0.6,
      }
    );

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
        },
      }
    );
  }, []);

  return (
    <>
      <div className="absolute p-5 right-0">
        <ContactForm />
      </div>
      <section className="bg-[#F4F7FA] min-h-screen flex items-center justify-center px-4">
        <div
          ref={containerRef}
          className="bg-white flex rounded-2xl shadow-lg max-w-3xl p-5 border border-black overflow-visible"
        >
          <div className="w-1/2 px-16">
            <h2
              ref={setRef(0)}
              className="font-bold text-3xl mt-10 flex items-center justify-center text-[#183A57]"
            >
              Login
            </h2>

            <form
              onSubmit={handleSubmit}
              className="gap-4 flex flex-col items-center"
            >
              <input
                ref={setRef(1)}
                className="p-2 mt-8 rounded-xl border w-full border-[#4A628A] text-[#1A1A1A]"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
              />
              <input
                ref={setRef(2)}
                className="p-2 rounded-xl border w-full border-[#4A628A] text-[#1A1A1A]"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
              />
              <button
                ref={buttonRef}
                className="bg-[#183A57] hover:bg-[#4A628A] rounded-xl text-white py-2 w-full transition duration-300 mb-3 relative z-10"
                type="submit"
              >
                Login
              </button>
            </form>
          </div>
          <div className="w-1/2">
            <img
              ref={logoRef}
              className="rounded-2xl"
              src={Logo}
              alt="icon preview"
            />
          </div>
        </div>
      </section>
    </>
  );
}
