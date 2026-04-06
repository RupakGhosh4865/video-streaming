import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const useSocket = (token) => {
    const socket = useRef(null);

    useEffect(() => {
        if (!token) return;

        socket.current = io(API_URL, {
            auth: {
                token: token
            }
        });

        socket.current.on('connect', () => {
            console.log('Socket.io connected');
        });

        socket.current.on('connect_error', (err) => {
            console.error('Socket.io connection error:', err.message);
        });

        return () => {
            if (socket.current) {
                socket.current.disconnect();
            }
        };
    }, [token]);

    const on = (event, callback) => {
        if (socket.current) {
            socket.current.on(event, callback);
        }
    };

    const off = (event, callback) => {
        if (socket.current) {
            socket.current.off(event, callback);
        }
    };

    return { on, off, socket: socket.current };
};
