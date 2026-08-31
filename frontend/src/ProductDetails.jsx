import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./ProductDetails.css";

function ProductDetails() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mainImage, setMainImage] = useState("/placeholder.png");
    const [selectedSize, setSelectedSize] = useState("");

    // Simulated standard sizes since inventory is still being built out
    const availableSizes = ["S", "M", "L", "XL", "XXL"];

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await fetch(`https://kitverse-production.up.railway.app/api/TShirt/${id}`);
                if (!response.ok) throw new Error("Product not found");
                const data = await response.json();
                setProduct(data);
                
                // Set default main image
                if (data.shirtLinks && data.shirtLinks.length > 0) {
                    // Try to find one with isMain (if backend implements it), otherwise use the first one
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
        
        // Scroll to top when page loads
        window.scrollTo(0, 0);
    }, [id]);

    if (loading) {
        return <div className="PDP-Loading">Loading product details...</div>;
    }

    if (!product) {
        return <div className="PDP-Error">Product not found.</div>;
    }

    return (
        <div className="PDP-Container">
            {/* LEFT SIDE: Image Gallery */}
            <div className="PDP-Gallery">
                <div className="PDP-MainImageContainer">
                    <img src={mainImage} alt={product.shirtName} className="PDP-MainImage" />
                </div>
                
                {/* Only show thumbnails if there is more than 1 image */}
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
                        <span className="PDP-SizeGuide">Size guide</span>
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

                <button 
                    className="PDP-AddToCartBtn"
                    disabled={!selectedSize}
                >
                    {selectedSize ? "ADD TO CART" : "SELECT A SIZE"}
                </button>

                <div className="PDP-DescriptionSection">
                    <p className="PDP-DescriptionText">{product.shirtDescription}</p>
                    
                    {/* Fallback Care / Material if backend adds it, else static text for now to match inspo */}
                    <p className="PDP-CareText">
                        {product.shirtCareInstructions || "Cool wash. Do not bleach. Cool iron. Do not tumble dry. Wash separately with like colours."}
                    </p>
                    <p className="PDP-MaterialText">
                        {product.shirtMaterial || "65% polyester Recycled, 35% viscose"}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default ProductDetails;
