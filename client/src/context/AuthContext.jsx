import { createContext, useState, useEffect, useRef } from "react";
import { jwtDecode } from 'jwt-decode';
import Lottie from "lottie-react";

import loginAnimation from '../assets/animations/Loading.json';
import logoutAnimation from '../assets/animations/Loading.json';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const [isAnimating, setIsAnimating] = useState(false);
    const [animationType, setAnimationType] = useState(null); // 'login' or 'logout'

    const timeoutRef = useRef(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decoded = jwtDecode(token);
                if (decoded.exp * 1000 < Date.now()) {
                    console.warn("Token expired");
                    localStorage.removeItem("token");
                    setUser(null);
                } else {
                    setUser(decoded);
                }
            } catch (err) {
                console.error("Invalid token", err);
                localStorage.removeItem("token");
                setUser(null);
            }
        }
        setLoading(false);

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        };
    }, []);

    const login = (token) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }

        setLoading(true);
        setIsAnimating(true);
        setAnimationType("login");

        timeoutRef.current = setTimeout(() => {
            try {
                localStorage.setItem("token", token);
                const decoded = jwtDecode(token);
                setUser(decoded);
            } catch (err) {
                console.error("Login failed, invalid token:", err);
                setUser(null);
            }
            setIsAnimating(false);
            setAnimationType(null);
            setLoading(false);
            timeoutRef.current = null;
        }, 2000);
    };

    const logout = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }

        setLoading(true);
        setIsAnimating(true);
        setAnimationType("logout");

        timeoutRef.current = setTimeout(() => {
            localStorage.removeItem("token");
            setUser(null);
            setIsAnimating(false);
            setAnimationType(null);
            setLoading(false);
            timeoutRef.current = null;
        }, 2000);
    };

    const isAuthenticated = !!user;

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, isAuthenticated }}>
            {children}
            {isAnimating && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 9999,
                }}>
                    <Lottie
                        animationData={animationType === "login" ? loginAnimation : logoutAnimation}
                        loop={false}
                        style={{ width: 200, height: 200 }}
                    />
                </div>
            )}
        </AuthContext.Provider>
    );
};