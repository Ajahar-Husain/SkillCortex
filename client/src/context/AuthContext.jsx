import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(true);

    const logout = useCallback(() => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
    }, []);

    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
            api.get('/api/auth/me')
                .then((res) => {
                    setUser(res.data);
                    setLoading(false);
                })
                .catch(() => {
                    logout();
                    setLoading(false);
                });
        } else {
            localStorage.removeItem('token');
            setUser(null);
            setLoading(false);
        }
    }, [token, logout]);

    const login = async (email, password) => {
        const res = await api.post('/api/auth/login', { email, password });
        setToken(res.data.token);
        setUser(res.data.user);
        return res.data;
    };

    const register = async (name, email, password, role, extra = {}) => {
        const res = await api.post('/api/auth/register', { name, email, password, role, ...extra });
        setToken(res.data.token);
        setUser(res.data.user);
        return res.data;
    };

    const googleLogin = async (payload) => {
        const res = await api.post('/api/auth/google', payload);
        setToken(res.data.token);
        setUser(res.data.user);
        return res.data;
    };

    const refreshUser = async () => {
        const res = await api.get('/api/auth/me');
        setUser(res.data);
        return res.data;
    };

    const updateProfile = async (patch) => {
        const res = await api.patch('/api/auth/profile', patch);
        setUser(res.data);
        return res.data;
    };

    const value = { user, setUser, token, login, register, googleLogin, logout, loading, refreshUser, updateProfile };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
