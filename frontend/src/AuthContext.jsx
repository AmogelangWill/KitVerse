import { createContext, useState, useEffect, useContext } from 'react';

// Context for managing current user session and authentication modal visibility
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthOpen, setIsAuthOpen] = useState(false);

    // Check localStorage on application load to restore an existing session
    useEffect(() => {
        const storedUser = localStorage.getItem('kitverse_user');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                if (parsedUser.token) {
                    // Inspect token expiration time from JWT payload
                    const payload = JSON.parse(atob(parsedUser.token.split('.')[1]));
                    if (payload.exp * 1000 < Date.now()) {
                        // Clear session if token has expired
                        localStorage.removeItem('kitverse_user');
                        setUser(null);
                    } else {
                        setUser(parsedUser);
                    }
                } else {
                    setUser(parsedUser);
                }
            } catch (err) {
                // Remove invalid storage data
                localStorage.removeItem('kitverse_user');
                setUser(null);
            }
        }
        setLoading(false);
    }, []);

    // Saves authenticated user information to state and persistent storage
    const login = (userData) => {
        localStorage.setItem('kitverse_user', JSON.stringify(userData));
        setUser(userData);
    };

    // Clears stored credentials and resets user state
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

// Hook to access authentication state and actions across components
export const useAuth = () => {
    return useContext(AuthContext);
};
