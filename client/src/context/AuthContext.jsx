import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(true);

    // Setup Axios defaults
    axios.defaults.baseURL = 'http://localhost:3001';

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            localStorage.setItem('token', token);

            // Verify token and fetch user
            axios.get('/api/auth/me')
                .then(res => {
                    setUser(res.data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Token invalid", err);
                    logout();
                    setLoading(false);
                });
        } else {
            delete axios.defaults.headers.common['Authorization'];
            localStorage.removeItem('token');
            setUser(null);
            setLoading(false);
        }
    }, [token]);

    const login = async (email, password) => {
        const res = await axios.post('/api/auth/login', { email, password });
        setToken(res.data.token);
        setUser(res.data.user);
        return res.data;
    };

    const register = async (name, email, password, role) => {
        const res = await axios.post('/api/auth/register', { name, email, password, role });
        setToken(res.data.token);
        setUser(res.data.user);
        return res.data;
    };

    const logout = () => {
        setToken(null);
        setUser(null);
    };

    const value = {
        user,
        token,
        login,
        register,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
