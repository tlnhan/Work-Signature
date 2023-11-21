import { useState, useEffect } from 'react';
import axios from 'axios';

const useAuth = () => {
    const [loggedIn, setLoggedIn] = useState(false);
    const [showLoginAlert, setShowLoginAlert] = useState(false);

    useEffect(() => {
        const checkLoginStatus = async () => {
            const token = localStorage.getItem('token');

            if (token) {
                try {
                    const response = await axios.get('http://localhost:8080/api/login', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (response.status === 200) {
                        setLoggedIn(true);
                    } else {
                        handleLogout();
                        setShowLoginAlert(true);
                    }
                } catch (error) {
                    console.error('Có lỗi bên server:', error);
                    handleLogout();
                    setShowLoginAlert(true);
                }
            } else {
                handleLogout();
                setShowLoginAlert(true);
            }
        };
        checkLoginStatus();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setLoggedIn(false);
    };

    return { loggedIn, handleLogout, showLoginAlert, setShowLoginAlert };
};

export default useAuth;