import React, { createContext, useState, useContext, useCallback } from 'react';
import './Toast.css';

// Context for displaying global notification toast messages
const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    // Shows a notification toast that automatically dismisses after a timeout
    const showToast = useCallback((message, type = 'info') => {
        const id = Date.now() + Math.random().toString();
        setToasts(prev => [...prev, { id, message, type }]);
    }, []);

    // Dismisses a specific toast manually
    const removeToast = (id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {toasts.length > 0 && (
                <div className="ToastOverlay">
                    <div className="ToastContainer">
                        {toasts.map(toast => (
                            <div key={toast.id} className={`Toast Toast--${toast.type}`}>
                                <div className="Toast-icon">
                                    {toast.type === 'success' && '✓'}
                                    {toast.type === 'error' && '✕'}
                                    {toast.type === 'info' && 'i'}
                                </div>
                                <div className="Toast-message">{toast.message}</div>
                                <button className="Toast-btn" onClick={() => removeToast(toast.id)}>Continue</button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </ToastContext.Provider>
    );
};

// Hook to trigger toast notifications anywhere in the app
export const useToast = () => useContext(ToastContext);
