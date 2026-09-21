import { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext.jsx';

// Context for managing shopping cart drawer state and item count badge
const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const { user } = useAuth();
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const [wishlistCount, setWishlistCount] = useState(0);

    // Retrieves total item quantity in user cart from the server
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
            console.error("Error fetching cart count:", err);
        }
    };

    // Retrieves total items in wishlist
    const fetchWishlistCount = async () => {
        if (!user) {
            setWishlistCount(0);
            return;
        }
        try {
            const res = await fetch(`https://kitverse-production.up.railway.app/api/Cart/wishlist/${user.userId}`, {
                headers: { "Authorization": `Bearer ${user.token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setWishlistCount(data.length || 0);
            }
        } catch (err) {
            console.error("Error fetching wishlist count:", err);
        }
    };

    // Keep badge count updated whenever the logged-in user changes
    useEffect(() => {
        fetchCartCount();
        fetchWishlistCount();
    }, [user]);

    return (
        <CartContext.Provider value={{ 
            cartCount, fetchCartCount, isCartOpen, setIsCartOpen,
            wishlistCount, fetchWishlistCount
        }}>
            {children}
        </CartContext.Provider>
    );
};

// Hook to access cart state, drawer toggle, and count updater
export const useCart = () => useContext(CartContext);
