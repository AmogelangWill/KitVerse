import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import SizeGuideDrawer from "./SizeGuideDrawer.jsx";
import { useAuth } from "./AuthContext.jsx";
import "./ProductDetails.css";

function ProductDetails() {
    const { id } = useParams();
    const { user } = useAuth();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedSize, setSelectedSize] = useState("");
    const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
    
    // Action states
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
    const [wishlistActive, setWishlistActive] = useState(false);

    // New state for Inventory
    const [inventoryInfo, setInventoryInfo] = useState({});
    const [inventoryLoading, setInventoryLoading] = useState(true);

    const availableSizes = ["S", "M", "L", "XL", "XXL"];

    useEffect(() => {
        const fetchProductAndInventory = async () => {
            try {
                // 1. Fetch main product details
                const response = await fetch(`https://kitverse-production.up.railway.app/api/TShirt/${id}`);
                if (!response.ok) throw new Error("Product not found");
                const data = await response.json();
                setProduct(data);
                
                if (data.shirtLinks && data.shirtLinks.length > 0) {
                    const mainIndex = data.shirtLinks.findIndex(link => link.isMain);
                    setCurrentIndex(mainIndex !== -1 ? mainIndex : 0);
                }

                // 2. Fetch inventory for each size simultaneously
                const inventoryData = {};
                await Promise.all(
                    availableSizes.map(async (size) => {
                        try {
                            // Note: Using the exact space in "Inventory " as coded in the backend route
                            const invRes = await fetch(`https://kitverse-production.up.railway.app/api/TShirt/Inventory%20/${size}/${id}/AmountPerSize`);
                            if (invRes.ok) {
                                const amountArray = await invRes.json();
                                // API returns an array (e.g. [15] or [0] or [])
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

    const handleAddToCart = async () => {
        if (!selectedSize) return;
        if (!user) {
            alert("Please sign in to add items to your cart.");
            return;
        }

        setIsAddingToCart(true);
        try {
            const res = await fetch(`https://kitverse-production.up.railway.app/api/Cart/${user.userId}/items/${id}?quantity=1`, {
                method: "POST"
            });
            if (res.ok) {
                // Dispatch a custom event that Header.jsx can listen to in order to open the CartDrawer
                window.dispatchEvent(new Event("open-cart"));
            } else {
                const errorData = await res.json();
                alert(errorData.message || "Failed to add item to cart.");
            }
        } catch (error) {
            console.error("Add to cart error:", error);
        } finally {
            setIsAddingToCart(false);
        }
    };

    const handleWishlist = async () => {
        if (!user) {
            alert("Please sign in to add items to your wishlist.");
            return;
        }

        setIsAddingToWishlist(true);
        try {
            // If it's already active, remove it. Otherwise add it.
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
                alert(errorData.message || "Failed to update wishlist.");
            }
        } catch (error) {
            console.error("Wishlist error:", error);
        } finally {
            setIsAddingToWishlist(false);
        }
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
                {/* LEFT: IMAGE GALLERY */}
                <div className="PDP-LeftGallery">
                    {product.shirtLinks && product.shirtLinks.length > 0 && (
                        <div className="PDP-Thumbnails">
                            {product.shirtLinks.map((link, index) => (
                                <button 
                                    key={link.linkId} 
                                    className={`PDP-ThumbnailBtn ${currentIndex === index ? 'active' : ''}`}
                                    onClick={() => setCurrentIndex(index)}
                                >
                                    <img src={link.shirtLinkUrl} alt={`Thumbnail ${index + 1}`} />
                                </button>
                            ))}
                        </div>
                    )}
                    <div className="PDP-MainImageContainer">
                        {hasMultipleImages && (
                            <button 
                                className="PDP-ImageNavBtn left"
                                onClick={() => setCurrentIndex((prev) => (prev === 0 ? product.shirtLinks.length - 1 : prev - 1))}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </button>
                        )}
                        
                        <img className="PDP-MainImage" src={currentImageUrl} alt={product.shirtName} />
                        
                        {hasMultipleImages && (
                            <button 
                                className="PDP-ImageNavBtn right"
                                onClick={() => setCurrentIndex((prev) => (prev === product.shirtLinks.length - 1 ? 0 : prev + 1))}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </button>
                        )}
                    </div>
                </div>

                {/* RIGHT: PRODUCT INFO & ACTIONS */}
                <div className="PDP-RightInfo">
                    {/* BREADCRUMB / BADGE (Optional layout elements) */}
                    <div className="PDP-Badges">
                        {product.shirtSeason && <span className="PDP-Badge">{product.shirtSeason}</span>}
                        {product.shirtGender && <span className="PDP-Badge">{product.shirtGender}</span>}
                    </div>

                    <h1 className="PDP-Title">{product.shirtName}</h1>
                    <h2 className="PDP-Price">R {product.shirtPrice.toFixed(2)}</h2>

                    {/* SIZE SELECTOR */}
                    <div className="PDP-SizeSection">
                        <div className="PDP-SizeHeader">
                            <span className="PDP-SizeLabel">Select Size</span>
                            <button className="PDP-SizeGuideBtn" onClick={() => setIsSizeGuideOpen(true)}>
                                Size Guide
                            </button>
                        </div>
                        
                        {inventoryLoading ? (
                            <div className="PDP-SizeLoading">Checking live inventory...</div>
                        ) : (
                            <div className="PDP-SizeGrid">
                                {availableSizes.map(size => {
                                    const amountAvailable = inventoryInfo[size] || 0;
                                    const isOutOfStock = amountAvailable === 0;

                                    return (
                                        <button 
                                            key={size}
                                            className={`PDP-SizeBtn ${selectedSize === size ? 'selected' : ''} ${isOutOfStock ? 'out-of-stock' : ''}`}
                                            onClick={() => !isOutOfStock && setSelectedSize(size)}
                                            disabled={isOutOfStock}
                                        >
                                            {size}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* ADD TO BAG & WISHLIST */}
                    <div className="PDP-Actions">
                        <button 
                            className="PDP-AddToCartBtn" 
                            onClick={handleAddToCart}
                            disabled={!selectedSize || isAddingToCart}
                        >
                            {isAddingToCart ? "ADDING..." : selectedSize ? "ADD TO CART" : "SELECT A SIZE"}
                        </button>
                        <button 
                            className={`PDP-WishlistBtn ${wishlistActive ? 'active' : ''}`} 
                            aria-label="Add to Wishlist"
                            onClick={handleWishlist}
                            disabled={isAddingToWishlist}
                        >
                            <svg viewBox="0 0 24 24" fill={wishlistActive ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                            </svg>
                        </button>
                    </div>

                    {/* PRODUCT INFORMATION TABLE */}
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
                                <span className="PDP-InfoKey">Team</span>
                                <span className="PDP-InfoValue">{product.team?.teamName || "N/A"}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* SIZE GUIDE DRAWER */}
            <SizeGuideDrawer isOpen={isSizeGuideOpen} onClose={() => setIsSizeGuideOpen(false)} />
        </>
    );
}

export default ProductDetails;
