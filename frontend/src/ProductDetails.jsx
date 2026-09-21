import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import SizeGuideDrawer from "./SizeGuideDrawer.jsx";
import { useAuth } from "./AuthContext.jsx";
import { useToast } from "./ToastContext.jsx";
import { useCart } from "./CartContext.jsx";
import "./ProductDetails.css";

// Displays individual product details, size selection, image gallery, and cart actions
function ProductDetails() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedSize, setSelectedSize] = useState("");
    const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
    const { user, setIsAuthOpen } = useAuth();
    const { showToast } = useToast();
    const { setIsCartOpen, fetchCartCount } = useCart();
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
    const [wishlistActive, setWishlistActive] = useState(false);
    
    const [inventoryInfo, setInventoryInfo] = useState({});
    const [inventoryLoading, setInventoryLoading] = useState(true);

    const availableSizes = ["S", "M", "L", "XL", "XXL"];

    // Loads product information and stock availability for each size on mount
    useEffect(() => {
        const fetchProductAndInventory = async () => {
            try {
                // Fetch product details
                const response = await fetch(`https://kitverse-production.up.railway.app/api/TShirt/${id}`);
                if (!response.ok) throw new Error("Product not found");
                const data = await response.json();
                setProduct(data);
                
                // Identify default main image if available
                if (data.shirtLinks && data.shirtLinks.length > 0) {
                    const mainIndex = data.shirtLinks.findIndex(link => link.isMain);
                    setCurrentIndex(mainIndex !== -1 ? mainIndex : 0);
                }

                // Query inventory levels across all available sizes
                const inventoryData = {};
                await Promise.all(
                    availableSizes.map(async (size) => {
                        try {
                            const invRes = await fetch(`https://kitverse-production.up.railway.app/api/TShirt/Inventory%20/${size}/${id}/AmountPerSize`);
                            if (invRes.ok) {
                                const amountArray = await invRes.json();
                                inventoryData[size] = amountArray.length > 0 ? amountArray[0] : 0;
                            } else {
                                inventoryData[size] = 0;
                            }
                        } catch (err) {
                            inventoryData[size] = 0;
                        }
                    })
                );
                
                setInventoryInfo(inventoryData);

            } catch (error) {
                console.error("Error fetching product details:", error);
            } finally {
                setLoading(false);
                setInventoryLoading(false);
            }
        };

        fetchProductAndInventory();
        window.scrollTo(0, 0);
    }, [id]);

    // Adds current product in selected size to user cart
    const handleAddToCart = async () => {
        if (!selectedSize) return;
        if (!user) {
            setIsAuthOpen(true);
            return;
        }

        setIsAddingToCart(true);
        try {
            const res = await fetch(`https://kitverse-production.up.railway.app/api/Cart/${user.userId}/items/${id}?quantity=1`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${user.token}`
                }
            });

            if (res.ok) {
                showToast(`Added ${product.shirtName} (${selectedSize}) to bag!`, "success");
                await fetchCartCount();
                setIsCartOpen(true);
            } else {
                const errorData = await res.json();
                showToast(errorData.message || "Failed to add item to bag.", "error");
            }
        } catch (error) {
            console.error("Add to cart error:", error);
        } finally {
            setIsAddingToCart(false);
        }
    };

    // Toggles the product in user wishlist
    const handleWishlist = async () => {
        if (!user) {
            setIsAuthOpen(true);
            return;
        }

        setIsAddingToWishlist(true);
        try {
            const method = wishlistActive ? "DELETE" : "POST";
            const res = await fetch(`https://kitverse-production.up.railway.app/api/Cart/Wishlist/${user.userId}/${id}`, {
                method: method,
                headers: {
                    "Authorization": `Bearer ${user.token}`
                }
            });
            
            if (res.ok) {
                setWishlistActive(!wishlistActive);
            } else {
                const errorData = await res.json();
                showToast(errorData.message || "Failed to update wishlist.", "error");
            }
        } catch (error) {
            console.error("Wishlist error:", error);
        } finally {
            setIsAddingToWishlist(false);
        }
    };

    // Cycles to the previous product image in the gallery
    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + product.shirtLinks.length) % product.shirtLinks.length);
    };

    // Cycles to the next product image in the gallery
    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % product.shirtLinks.length);
    };

    if (loading) {
        return <div className="PDP-Loading">Loading product details...</div>;
    }

    if (!product) {
        return <div className="PDP-Error">Product not found.</div>;
    }

    const hasMultipleImages = product.shirtLinks && product.shirtLinks.length > 1;
    const currentImageUrl = product.shirtLinks && product.shirtLinks.length > 0 
        ? product.shirtLinks[currentIndex].shirtLinkUrl 
        : "/placeholder.png";

    return (
        <>
            <div className="PDP-Container">
                {/* Product Image Gallery */}
                <div className="PDP-Gallery">
                    <div className="PDP-MainImageContainer" style={{ position: 'relative' }}>
                        {hasMultipleImages && (
                            <button className="PDP-ArrowBtn left" onClick={handlePrev} aria-label="Previous image">❮</button>
                        )}
                        
                        <img src={currentImageUrl} alt={product.shirtName} className="PDP-MainImage" />
                        
                        {hasMultipleImages && (
                            <button className="PDP-ArrowBtn right" onClick={handleNext} aria-label="Next image">❯</button>
                        )}
                    </div>
                    
                    {hasMultipleImages && (
                        <div className="PDP-Thumbnails">
                            {product.shirtLinks.map((link, index) => (
                                <img 
                                    key={link.linkId}
                                    src={link.shirtLinkUrl} 
                                    alt={`${product.shirtName} thumbnail`}
                                    className={`PDP-Thumbnail ${currentIndex === index ? 'active' : ''}`}
                                    onClick={() => setCurrentIndex(index)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Product Purchasing Information */}
                <div className="PDP-Info">
                    <div className="PDP-Header">
                        <span className="PDP-Brand">{product.shirtAffiliate || "Premium Kit"}</span>
                        <h1 className="PDP-Title">{product.team?.teamName} {product.shirtSeason} Jersey</h1>
                        <p className="PDP-Price">R {product.shirtPrice.toFixed(2)}</p>
                    </div>

                    <div className="PDP-SizeSection">
                        <div className="PDP-SizeHeader">
                            <span className="PDP-SizeLabel">Size</span>
                            <span className="PDP-SizeGuide" onClick={() => setIsSizeGuideOpen(true)}>Size guide</span>
                        </div>
                        <div className="PDP-SizeGrid">
                            {availableSizes.map((size) => {
                                const isOutOfStock = !inventoryLoading && (!inventoryInfo[size] || inventoryInfo[size] <= 0);
                                return (
                                    <button 
                                        key={size}
                                        className={`PDP-SizeBtn ${selectedSize === size ? 'selected' : ''} ${isOutOfStock ? 'out-of-stock' : ''}`}
                                        onClick={() => !isOutOfStock && setSelectedSize(size)}
                                        disabled={isOutOfStock || inventoryLoading}
                                        title={isOutOfStock ? 'Out of stock' : `${inventoryInfo[size]} available`}
                                    >
                                        {size}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Cart and Wishlist actions */}
                    <div className="PDP-Actions">
                        <button className="PDP-AddToCartBtn" onClick={handleAddToCart} disabled={!selectedSize || isAddingToCart}>
                            {isAddingToCart ? "ADDING..." : selectedSize ? "ADD TO CART" : "SELECT A SIZE"}
                        </button>
                        <button className={`PDP-WishlistBtn ${wishlistActive ? 'active' : ''}`} aria-label="Add to Wishlist" onClick={handleWishlist} disabled={isAddingToWishlist}>
                            <svg viewBox="0 0 24 24" fill={wishlistActive ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                            </svg>
                        </button>
                    </div>

                    {/* Detailed Specifications and Garment Care */}
                    <div className="PDP-ProductInformation">
                        <h3 className="PDP-InfoTitle">Product Information</h3>
                        <div className="PDP-InfoTable">
                            <div className="PDP-InfoRow">
                                <span className="PDP-InfoKey">Description</span>
                                <span className="PDP-InfoValue">{product.shirtDescription}</span>
                            </div>
                            <div className="PDP-InfoRow">
                                <span className="PDP-InfoKey">Care Instructions</span>
                                <span className="PDP-InfoValue">
                                    {product.shirtCareInstructions || "Cool wash. Do not bleach. Cool iron. Do not tumble dry. Wash separately with like colours."}
                                </span>
                            </div>
                            <div className="PDP-InfoRow">
                                <span className="PDP-InfoKey">Material</span>
                                <span className="PDP-InfoValue">
                                    {product.shirtMaterial || "65% polyester Recycled, 35% viscose"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sizing Information Drawer */}
            <SizeGuideDrawer isOpen={isSizeGuideOpen} onClose={() => setIsSizeGuideOpen(false)} />
        </>
    );
}

export default ProductDetails;
