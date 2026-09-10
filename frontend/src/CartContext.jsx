import { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext.jsx';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const { user } = useAuth();
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [cartCount, setCartCount] = useState(0);

    const fetchCartCount = async () => {
        if (!user) {
            setCartCount(0);
            return;
        }
        try {
            const res = await fetch(`https://kitverse-production.up.railway.app/api/Cart/${user.userId}`);
            if (res.ok) {
                const data = await res.json();
                const count = data.itemLists?.reduce((total, item) => total + item.quantity, 0) || 0;
                setCartCount(count);
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Automatically fetch when user logs in
    useEffect(() => {
        fetchCartCount();
    }, [user]);

    return (
        <CartContext.Provider value={{ cartCount, fetchCartCount, isCartOpen, setIsCartOpen }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
