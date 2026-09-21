import { useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import "./CartDrawer.css";

import { useCart } from "./CartContext.jsx";

function WishlistDrawer({ isOpen, onClose }) {
    const { user } = useAuth();
    const { fetchWishlistCount } = useCart();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isOpen || !user) return;
        
        const fetchWishlist = async () => {
            setLoading(true);
            try {
                const response = await fetch(`https://kitverse-production.up.railway.app/api/Cart/wishlist/${user.userId}`, {
                    headers: {
                        Authorization: `Bearer ${user.token}`
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    setProducts(data);
                }
            } catch (error) {
                console.error("Could not fetch wishlist:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchWishlist();
    }, [isOpen, user]);

    const removeItems = async (tshirtId) => {
        if (!user) return;
        try {
            const response = await fetch(`https://kitverse-production.up.railway.app/api/Cart/Wishlist/${user.userId}/${tshirtId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            });

            if (response.ok) {
                setProducts(prev => prev.filter(tshirt => tshirt.tShirtId !== tshirtId));
                fetchWishlistCount();
            }
        } catch (error) {
            console.error("Could not remove an item:", error);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className={`CartOverlay ${isOpen ? 'open' : ''}`} onClick={onClose}></div>
            <div className={`CartDrawer ${isOpen ? 'open' : ''}`}>
                <div className="CartHeader">
                    <h3>Your Wishlist</h3>
                    <button className="CartCloseBtn" onClick={onClose} aria-label="Close">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <div className="CartContent">
                    {!user ? (
                        <div className="CartEmpty">
                            <p>Please sign in to view your wishlist.</p>
                        </div>
                    ) : loading && products.length === 0 ? (
                        <div className="CartLoading">Loading wishlist...</div>
                    ) : products.length > 0 ? (
                        <div className="CartItemsList">
                            {products.map((tshirt) => (
                                <div key={tshirt.tShirtId} className="CartItem">
                                    <div className="CartItemImage">
                                        <img 
                                            src={tshirt.shirtLinks?.[0]?.shirtLinkUrl || "/placeholder.png"} 
                                            alt={tshirt.shirtName || "Product"} 
                                        />
                                    </div>
                                    <div className="CartItemDetails">
                                        <h4 className="CartItemName">{tshirt.team?.teamName} {tshirt.shirtSeason} Jersey</h4>
                                        <p className="CartItemPrice">R {tshirt.shirtPrice?.toFixed(2)}</p>
                                        <div className="CartItemControls">
                                            <button className="CartItemRemove" onClick={() => removeItems(tshirt.tShirtId)}>
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="CartEmpty">
                            <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                            </svg>
                            <p>Your wishlist is empty.</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default WishlistDrawer;
