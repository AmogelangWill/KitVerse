import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import SizeGuideDrawer from "./SizeGuideDrawer.jsx";
import "./ProductDetails.css";

function ProductDetails() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mainImage, setMainImage] = useState("/placeholder.png");
    const [selectedSize, setSelectedSize] = useState("");
    const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

    const availableSizes = ["S", "M", "L", "XL", "XXL"];

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await fetch(`https://kitverse-production.up.railway.app/api/TShirt/${id}`);
                if (!response.ok) throw new Error("Product not found");
                const data = await response.json();
                setProduct(data);
                
                if (data.shirtLinks && data.shirtLinks.length > 0) {
                    const mainLink = data.shirtLinks.find(link => link.isMain) || data.shirtLinks[0];
                    setMainImage(mainLink.shirtLinkUrl);
                }
            } catch (error) {
                console.error("Error fetching product details:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
        window.scrollTo(0, 0);
    }, [id]);

    if (loading) {
        return <div className="PDP-Loading">Loading product details...</div>;
    }

    if (!product) {
        return <div className="PDP-Error">Product not found.</div>;
    }

    return (
        <>
            <div className="PDP-Container">
                {/* LEFT SIDE: Image Gallery */}
                <div className="PDP-Gallery">
                    <div className="PDP-MainImageContainer">
                        <img src={mainImage} alt={product.shirtName} className="PDP-MainImage" />
                    </div>
                    
                    {product.shirtLinks && product.shirtLinks.length > 1 && (
                        <div className="PDP-Thumbnails">
                            {product.shirtLinks.map((link) => (
                                <img 
                                    key={link.linkId}
                                    src={link.shirtLinkUrl} 
                                    alt={`${product.shirtName} thumbnail`}
                                    className={`PDP-Thumbnail ${mainImage === link.shirtLinkUrl ? 'active' : ''}`}
                                    onClick={() => setMainImage(link.shirtLinkUrl)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* RIGHT SIDE: Product Info */}
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
                            {availableSizes.map((size) => (
                                <button 
                                    key={size}
                                    className={`PDP-SizeBtn ${selectedSize === size ? 'selected' : ''}`}
                                    onClick={() => setSelectedSize(size)}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ACTIONS: Add to Cart + Wishlist */}
                    <div className="PDP-Actions">
                        <button className="PDP-AddToCartBtn" disabled={!selectedSize}>
                            {selectedSize ? "ADD TO CART" : "SELECT A SIZE"}
                        </button>
                        <button className="PDP-WishlistBtn" aria-label="Add to Wishlist">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                            </svg>
                        </button>
                    </div>

                    {/* PRODUCT INFORMATION TABLE/ACCORDION */}
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

            {/* Slide Out Drawer */}
            <SizeGuideDrawer isOpen={isSizeGuideOpen} onClose={() => setIsSizeGuideOpen(false)} />
        </>
    );
}

export default ProductDetails;
