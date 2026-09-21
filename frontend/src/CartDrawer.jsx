import { useState, useEffect } from "react";
import { useAuth } from "./AuthContext.jsx";
import { useCart } from "./CartContext.jsx";
import "./CartDrawer.css";

// Side drawer component presenting items currently in user shopping bag
function CartDrawer() {
    const { user } = useAuth();
    const { isCartOpen, setIsCartOpen, fetchCartCount } = useCart();
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(false);

    // Refresh cart items whenever drawer opens or authenticated user changes
    useEffect(() => {
        if (isCartOpen && user) {
            fetchCart();
        }
    }, [isCartOpen, user]);

    // Loads current cart items and total amount for user
    const fetchCart = async () => {
        setLoading(true);
        try {
            const res = await fetch(`https://kitverse-production.up.railway.app/api/Cart/${user.userId}`);
            if (res.ok) {
                const data = await res.json();
                setCart(data);
                fetchCartCount();
            }
        } catch (error) {
            console.error("Error fetching cart:", error);
        } finally {
            setLoading(false);
        }
    };

    // Modifies quantity of an item in the cart
    const updateQuantity = async (itemId, newQuantity) => {
        if (newQuantity < 1) return;
        try {
            const res = await fetch(`https://kitverse-production.up.railway.app/api/Cart/${user.userId}/items/${itemId}?quantity=${newQuantity}`, {
                method: "PUT",
            });
            if (res.ok) {
                fetchCart();
            }
        } catch (error) {
            console.error("Error updating quantity:", error);
        }
    };

    // Removes a line item completely from the cart
    const removeItem = async (itemId) => {
        try {
            const res = await fetch(`https://kitverse-production.up.railway.app/api/Cart/${user.userId}/items/${itemId}`, {
                method: "DELETE",
            });
            if (res.ok) {
                fetchCart();
            }
        } catch (error) {
            console.error("Error removing item:", error);
        }
    };

    // Clears all items currently in user cart
    const clearCart = async () => {
        try {
            const res = await fetch(`https://kitverse-production.up.railway.app/api/Cart/${user.userId}/clear`, {
                method: "POST",
            });
            if (res.ok) {
                fetchCart();
            }
        } catch (error) {
            console.error("Error clearing cart:", error);
        }
    };

    // Initiates payment process with the backend and redirects to Paystack
    const handleCheckout = async () => {
        if (!cart || !user) return;
        setLoading(true);
        try {
            const res = await fetch("https://kitverse-production.up.railway.app/api/Payment/initialize", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${user.token}`
                },
                body: JSON.stringify({
                    cartId: cart.cartId,
                    email: user.userEmail
                })
            });

            const data = await res.json();
            if (res.ok && data.authorizationUrl) {
                // Redirect user directly to Paystack's secure checkout URL
                window.location.href = data.authorizationUrl;
            } else {
                alert(data.message || "Failed to initialize checkout.");
            }
        } catch (error) {
            console.error("Checkout error:", error);
            alert("Network error during checkout.");
        } finally {
            setLoading(false);
        }
    };

    if (!isCartOpen) return null;

    // Transaction Rules Calculation for UI Breakdown
    let rawSubtotal = 0;
    let shipping = 0;
    let discount = 0;
    let totalItems = 0;

    if (cart && cart.itemLists) {
        rawSubtotal = cart.itemLists.reduce((sum, item) => sum + (item.unitPurchaseAtTime * item.quantity), 0);
        totalItems = cart.itemLists.reduce((sum, item) => sum + item.quantity, 0);
        
        if (rawSubtotal > 0) {
            shipping = rawSubtotal >= 1500 ? 0 : 150;
            discount = totalItems >= 3 ? (rawSubtotal * 0.10) : 0;
        }
    }

    return (
        <>
            <div className={`CartOverlay ${isCartOpen ? 'open' : ''}`} onClick={() => setIsCartOpen(false)}></div>
            <div className={`CartDrawer ${isCartOpen ? 'open' : ''}`}>
                <div className="CartHeader">
                    <h3>Your Cart</h3>
                    <button className="CartCloseBtn" onClick={() => setIsCartOpen(false)} aria-label="Close">
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
                        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', color: '#4b5563'}}>
                            <span>Subtotal</span>
                            <span>R {rawSubtotal.toFixed(2)}</span>
                        </div>
                        
                        {discount > 0 && (
                            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', color: '#16a34a', fontWeight: 'bold'}}>
                                <span>Volume Discount (3+ items)</span>
                                <span>- R {discount.toFixed(2)}</span>
                            </div>
                        )}
                        
                        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '14px', color: '#4b5563'}}>
                            <span>Shipping</span>
                            <span>{shipping === 0 ? "Free" : `R ${shipping.toFixed(2)}`}</span>
                        </div>

                        <div className="CartTotal" style={{borderTop: '1px solid #e5e7eb', paddingTop: '16px'}}>
                            <span>Total</span>
                            <span>R {cart.totalCost?.toFixed(2) || "0.00"}</span>
                        </div>
                        <p className="CartTaxNote">Includes 15% VAT calculation.</p>
                        <button className="CartCheckoutBtn" onClick={handleCheckout} disabled={loading}>
                            {loading ? "PROCESSING..." : "PROCEED TO CHECKOUT"}
                        </button>
                        <button className="CartClearBtn" onClick={clearCart} disabled={loading}>Clear Cart</button>
                    </div>
                )}
            </div>
        </>
    );
}

export default CartDrawer;
