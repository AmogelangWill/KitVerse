import { useState, useEffect } from "react";
import { useAuth } from "./AuthContext.jsx";
import "./CartDrawer.css";

function CartDrawer({ isOpen, onClose }) {
    const { user } = useAuth();
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(false);

    // Fetch the cart whenever the drawer opens or the user changes
    useEffect(() => {
        if (isOpen && user) {
            fetchCart();
        }
    }, [isOpen, user]);

    const fetchCart = async () => {
        setLoading(true);
        try {
            const res = await fetch(`https://kitverse-production.up.railway.app/api/Cart/${user.userId}`);
            if (res.ok) {
                const data = await res.json();
                setCart(data);
            }
        } catch (error) {
            console.error("Error fetching cart:", error);
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (itemId, newQuantity) => {
        if (newQuantity < 1) return;
        try {
            const res = await fetch(`https://kitverse-production.up.railway.app/api/Cart/${user.userId}/items/${itemId}?quantity=${newQuantity}`, {
                method: "PUT",
            });
            if (res.ok) fetchCart();
        } catch (error) {
            console.error("Error updating quantity:", error);
        }
    };

    const removeItem = async (itemId) => {
        try {
            const res = await fetch(`https://kitverse-production.up.railway.app/api/Cart/${user.userId}/items/${itemId}`, {
                method: "DELETE",
            });
            if (res.ok) fetchCart();
        } catch (error) {
            console.error("Error removing item:", error);
        }
    };

    const clearCart = async () => {
        try {
            const res = await fetch(`https://kitverse-production.up.railway.app/api/Cart/${user.userId}/clear`, {
                method: "POST",
            });
            if (res.ok) fetchCart();
        } catch (error) {
            console.error("Error clearing cart:", error);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className={`CartOverlay ${isOpen ? 'open' : ''}`} onClick={onClose}></div>
            <div className={`CartDrawer ${isOpen ? 'open' : ''}`}>
                <div className="CartHeader">
                    <h3>Your Cart</h3>
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
                            <p>Please sign in to view your cart.</p>
                        </div>
                    ) : loading && !cart ? (
                        <div className="CartLoading">Loading cart...</div>
                    ) : cart?.itemLists?.length > 0 ? (
                        <div className="CartItemsList">
                            {cart.itemLists.map((item) => (
                                <div key={item.tShirtId} className="CartItem">
                                    <div className="CartItemImage">
                                        <img 
                                            // Fallback to placeholder if backend doesn't return ShirtLinks in Cart
                                            src={item.tShirt?.shirtLinks?.[0]?.shirtLinkUrl || "/placeholder.png"} 
                                            alt={item.tShirt?.shirtName || "Product"} 
                                        />
                                    </div>
                                    <div className="CartItemDetails">
                                        <h4 className="CartItemName">{item.tShirt?.team?.teamName} {item.tShirt?.shirtSeason} Jersey</h4>
                                        <p className="CartItemPrice">R {item.unitPurchaseAtTime.toFixed(2)}</p>
                                        <div className="CartItemControls">
                                            <div className="CartItemQuantity">
                                                <button onClick={() => updateQuantity(item.tShirtId, item.quantity - 1)}>-</button>
                                                <span>{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.tShirtId, item.quantity + 1)}>+</button>
                                            </div>
                                            <button className="CartItemRemove" onClick={() => removeItem(item.tShirtId)}>
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
                                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                                <line x1="3" y1="6" x2="21" y2="6"></line>
                                <path d="M16 10a4 4 0 0 1-8 0"></path>
                            </svg>
                            <p>Your shopping bag is empty.</p>
                        </div>
                    )}
                </div>

                {user && cart?.itemLists?.length > 0 && (
                    <div className="CartFooter">
                        <div className="CartTotal">
                            <span>Subtotal</span>
                            <span>R {cart.totalCost?.toFixed(2) || "0.00"}</span>
                        </div>
                        <p className="CartTaxNote">Taxes and shipping calculated at checkout</p>
                        <button className="CartCheckoutBtn">PROCEED TO CHECKOUT</button>
                        <button className="CartClearBtn" onClick={clearCart}>Clear Cart</button>
                    </div>
                )}
            </div>
        </>
    );
}

export default CartDrawer;
