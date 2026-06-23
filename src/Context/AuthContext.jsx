// src/context/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false); // مبدئياً false لحد ما نحتاجه
    const location = useLocation();

    const checkAuth = async () => {
        setLoading(true);
        try {
            const res = await axios.get(
                `${process.env.REACT_APP_API_URL}/api/v1/auth/check-user`,
                { withCredentials: true }
            );

            if (res.data.success) {
                setIsAuthenticated(true);
                setUser(res.data.data);
            } else {
                setIsAuthenticated(false);
                setUser(null);
            }
        } catch (err) {
            setIsAuthenticated(false);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // ✅ يشغل checkAuth فقط لو المستخدم في مسار admin أو login
        checkAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, loading, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
