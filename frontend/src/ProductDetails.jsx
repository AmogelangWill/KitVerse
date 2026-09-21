import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import SizeGuideDrawer from "./SizeGuideDrawer.jsx";
import ReviewsDrawer from "./ReviewsDrawer.jsx";
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
    const [isReviewsOpen, setIsReviewsOpen] = useState(false);
    const { user, setIsAuthOpen } = useAuth();
    const { showToast } = useToast();
    const { setIsCartOpen, fetchCartCount } = useCart();
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
    const [wishlistActive, setWishlistActive] = useState(false);
    
    const [inventoryInfo, setInventoryInfo] = useState({});
    const [inventoryLoading, setInventoryLoading] = useState(true);
    const [reviews, setReviews] = useState([]);

    const availableSizes = ["S", "M", "L", "XL", "XXL"];

    const fetchReviews = async () => {
        try {
            const res = await fetch(`https://kitverse-production.up.railway.app/api/Review/shirt/${id}`);
            if (res.ok) {
                setReviews(await res.json());
            }
        } catch (err) {
            console.error("Failed to load reviews", err);
        }
    };

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

                // Load reviews
                fetchReviews();

                // Check wishlist status if user is logged in
                if (user) {
                    try {
                        const wishRes = await fetch(`https://kitverse-production.up.railway.app/api/Cart/Wishlist/${user.userId}`, {
                            headers: { "Authorization": `Bearer ${user.token}` }
                        });
                        if (wishRes.ok) {
                            const wishItems = await wishRes.json();
                            setWishlistActive(wishItems.some(w => w.tShirtId === data.tShirtId));
                        }
                    } catch (e) {
                        console.error("Wishlist check error", e);
                    }
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
                        
                        {/* Foschini-style Reviews Summary */}
                        <div className="PDP-ReviewsSummary" style={{display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px'}}>
                            <div style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                                <div style={{display: 'flex'}}>
                                    {[1, 2, 3, 4, 5].map(star => {
                                        const avgRating = reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.stars, 0) / reviews.length) : 0;
                                        return (
                                            <svg key={star} width="14" height="14" viewBox="0 0 14 13" fill="currentColor" style={{color: star <= avgRating ? '#040404' : '#d1d5db'}}>
                                                <path d="M13.0813 5.32656C13.0265 5.15429 12.921 5.00258 12.7785 4.89132C12.636 4.78007 12.4632 4.71447 12.2828 4.70312L9.0344 4.47891L7.83127 1.44375C7.76557 1.27663 7.65122 1.13307 7.50302 1.03167C7.35482 0.93027 7.17959 0.875691 7.00002 0.875C6.82045 0.875691 6.64522 0.93027 6.49702 1.03167C6.34882 1.13307 6.23447 1.27663 6.16877 1.44375L4.94377 4.49531L1.71721 4.70312C1.53701 4.71521 1.36459 4.78108 1.22225 4.89223C1.0799 5.00338 0.974186 5.15468 0.91877 5.32656C0.861862 5.50108 0.858537 5.68865 0.909224 5.86508C0.95991 6.0415 1.06228 6.1987 1.20314 6.31641L3.68596 8.41641L2.94768 11.3203C2.8966 11.5168 2.90579 11.724 2.97406 11.9152C3.04233 12.1063 3.16652 12.2725 3.33049 12.3922C3.48965 12.5064 3.67927 12.5706 3.87509 12.5764C4.07091 12.5823 4.26402 12.5295 4.42971 12.425L6.99455 10.8008H7.00549L9.76721 12.5453C9.90887 12.6374 10.074 12.6867 10.243 12.6875C10.3809 12.6864 10.5168 12.6537 10.6401 12.5919C10.7635 12.5301 10.871 12.4409 10.9544 12.331C11.0379 12.2211 11.095 12.0936 11.1215 11.9582C11.1479 11.8228 11.143 11.6832 11.1071 11.55L10.325 8.37266L12.7969 6.31641C12.9378 6.1987 13.0401 6.0415 13.0908 5.86508C13.1415 5.68865 13.1382 5.50108 13.0813 5.32656Z" />
                                            </svg>
                                        );
                                    })}
                                </div>
                                <span style={{fontSize: '14px', fontWeight: '500', marginLeft: '4px'}}>
                                    {reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.stars, 0) / reviews.length).toFixed(1) : "0.0"}
                                </span>
                            </div>
                            <span 
                                onClick={() => setIsReviewsOpen(true)}
                                style={{fontSize: '14px', color: '#6b7280', textDecoration: 'underline', cursor: 'pointer', marginLeft: '8px'}}
                            >
                                Read {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                            </span>
                        </div>
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
            
            {/* Foschini-style Ratings & Reviews Drawer */}
            <ReviewsDrawer 
                isOpen={isReviewsOpen} 
                onClose={() => setIsReviewsOpen(false)} 
                reviews={reviews} 
                tshirtId={id} 
                onReviewAdded={fetchReviews} 
            />
        </>
    );
}

export default ProductDetails;
