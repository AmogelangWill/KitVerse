import { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthOpen, setIsAuthOpen] = useState(false);

    useEffect(() => {
        // Load token and user details from localStorage on app start
        const storedUser = localStorage.getItem('kitverse_user');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                if (parsedUser.token) {
                    // Decode the JWT payload (middle section)
                    const payload = JSON.parse(atob(parsedUser.token.split('.')[1]));
                    // exp is in seconds, Date.now() is in milliseconds
                    if (payload.exp * 1000 < Date.now()) {
                        // Token is expired! Kick the user out.
                        localStorage.removeItem('kitverse_user');
                        setUser(null);
                    } else {
                        setUser(parsedUser);
                    }
                } else {
                    setUser(parsedUser);
                }
            } catch (err) {
                // If token is invalid or parsing fails, clear it out
                localStorage.removeItem('kitverse_user');
                setUser(null);
            }
        }
        setLoading(false);
    }, []);

    const login = (userData) => {
        // userData from backend includes: token, userId, userName, userEmail, role
        localStorage.setItem('kitverse_user', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('kitverse_user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, isAuthOpen, setIsAuthOpen }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
