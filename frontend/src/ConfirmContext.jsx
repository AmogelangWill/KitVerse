import React, { createContext, useState, useContext, useCallback } from 'react';
import './ConfirmModal.css';

const ConfirmContext = createContext();

export const ConfirmProvider = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [config, setConfig] = useState({});
    const [resolveCallback, setResolveCallback] = useState(null);

    const confirm = useCallback((options) => {
        return new Promise((resolve) => {
            setConfig(options);
            setResolveCallback(() => resolve);
            setIsOpen(true);
        });
    }, []);

    const handleConfirm = () => {
        setIsOpen(false);
        if (resolveCallback) resolveCallback(true);
    };

    const handleCancel = () => {
        setIsOpen(false);
        if (resolveCallback) resolveCallback(false);
    };

    return (
        <ConfirmContext.Provider value={{ confirm }}>
            {children}
            {isOpen && (
                <div className="ConfirmOverlay" onClick={handleCancel}>
                    <div className="ConfirmModal" onClick={(e) => e.stopPropagation()}>
                        <div className="ConfirmModal-Header">
                            <h3 className="ConfirmModal-Title">{config.title || "Confirm Action"}</h3>
                        </div>
                        <div className="ConfirmModal-Body">
                            <p>{config.message || "Are you sure you want to proceed?"}</p>
                        </div>
                        <div className="ConfirmModal-Footer">
                            <button className="ConfirmBtn ConfirmBtn--Cancel" onClick={handleCancel}>
                                {config.cancelText || "Cancel"}
                            </button>
                            <button 
                                className={`ConfirmBtn ${config.danger ? 'ConfirmBtn--Danger' : 'ConfirmBtn--Primary'}`} 
                                onClick={handleConfirm}
                            >
                                {config.confirmText || "Confirm"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ConfirmContext.Provider>
    );
};

export const useConfirm = () => useContext(ConfirmContext);
