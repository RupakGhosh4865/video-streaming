import React, { createContext, useState, useEffect, useContext } from 'react';
import authService, { register as registerApi, login as loginApi, logout as logoutApi } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Axios Interceptor for 401 responses
        const interceptor = authService.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
                    logout();
                }
                return Promise.reject(error);
            }
        );

        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');
        if (storedUser && storedToken) {
            setUser(JSON.parse(storedUser));
            setIsAuthenticated(true);
            authService.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }
        setLoading(false);

        return () => {
             authService.interceptors.response.eject(interceptor);
        };
    }, []);

    const register = async (userData) => {
        const data = await registerApi(userData);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
        setUser(data);
        setIsAuthenticated(true);
        return data; // Return data for better handle
    };

    const login = async (userData) => {
        const data = await loginApi(userData);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
        setUser(data);
        setIsAuthenticated(true);
        return data; // Return data for better handle
    };

    const logout = () => {
        logoutApi();
        setUser(null);
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ user, loading, isAuthenticated, register, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
