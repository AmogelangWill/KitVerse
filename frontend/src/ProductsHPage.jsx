import { useState, useEffect } from "react";
import "./ProductsPage.css";
import { useNavigate } from "react-router-dom";

function ProductHPage() {
    const [cafProducts, setCafProducts] = useState([]);
    const [betwayProducts, setBetwayProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch("https://kitverse-production.up.railway.app/api/TShirt");
                if (!response.ok) throw new Error("Failed to fetch products");
                const data = await response.json();

                // 1. Identify specific CAF shirts
                const cafNames = ["Chiefs_Home", "Pirates_Home", "Sundowns_Home","Sundowns_Away"];
                
                // Keep the exact order of the cafNames array
                const caf = cafNames
                    .map(name => data.find(item => item.shirtName === name))
                    .filter(item => item !== undefined); 

                // 2. Pick 8 random shirts for the Betway Premiership section
                // First, exclude the ones already in the CAF section to avoid duplication
                const remaining = data.filter(item => !cafNames.includes(item.shirtName));
                
                // Shuffle and pick 8
                const shuffled = remaining.sort(() => 0.5 - Math.random());
                const betway = shuffled.slice(0, 8);

                setCafProducts(caf);
                setBetwayProducts(betway);
            } catch (error) {
                console.error("Error fetching products:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // Format the database price
    const formatPrice = (price) => {
        return `R${price.toFixed(2)}`;
    };

    return (
        <div className="BodyWrapper">
            {/* CAF SERIES SECTION */}
            <div className="Description">
                <h2 className="DOutliner">
                    CAF 26/27 series
                </h2>
                <div className="FilterDiv">
                    <button className="BtnFilter" onClick={() => navigate('/collections?competitionName=CAF')}>
                        <span className="FilterText">All Collections</span>
                        <svg className="ChevronRightSVG" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                    </button>
                </div>
            </div>

            <div className="ProductsContainer">
                {loading ? (
                    <p>Loading CAF series...</p>
                ) : (
                    cafProducts.map((product) => (
                        <div className="Product" key={product.tShirtId} onClick={() => navigate(`/product/${product.tShirtId}`)} style={{ cursor: "pointer" }}>
                            <div className="ProductImgWrapper">
                                <img
                                    className="ProductImg"
                                    src={product.shirtLinks && product.shirtLinks.length > 0 ? product.shirtLinks[0].shirtLinkUrl : "/placeholder.png"}
                                    alt={`${product.team.teamName} ${product.shirtSeason} Jersey`}
                                    loading="lazy"
                                />
                                <div className="ShopNowOverlay">
                                    Add To Cart <svg className="ChevronRightSVG" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                                </div>
                            </div>
                            <p className="PDescription">{`${product.team.teamName} ${product.shirtSeason} Jersey`}</p>
                            <p className="PPrice">{formatPrice(product.shirtPrice)}</p>
                        </div>
                    ))
                )}
            </div>

            {/* BETWAY PREMIERSHIP SERIES SECTION */}
            <div className="Description" style={{ marginTop: "60px" }}>
                <h2 className="DOutliner">
                    <span className="DesktopTitle">BETWAY PREMIERSHIP SERIES</span>
                    <span className="MobileTitle">PSL 26/27 SERIES</span>
                </h2>
                <div className="FilterDiv">
                    <button className="BtnFilter" onClick={() => navigate('/collections?competitionName=Betway')}>
                        <span className="FilterText">All Collections</span>
                        <svg className="ChevronRightSVG" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                    </button>
                </div>
            </div>

            <div className="ProductsContainer">
                {loading ? (
                    <p>Loading Betway Premiership series...</p>
                ) : (
                    betwayProducts.map((product) => (
                        <div className="Product" key={product.tShirtId} onClick={() => navigate(`/product/${product.tShirtId}`)} style={{ cursor: "pointer" }}>
                            <div className="ProductImgWrapper">
                                <img
                                    className="ProductImg"
                                   src={product.shirtLinks && product.shirtLinks.length > 0 ? product.shirtLinks[0].shirtLinkUrl : "/placeholder.png"}
                                    alt={`${product.team.teamName} ${product.shirtSeason} Jersey`}
                                    loading="lazy"
                                />
                                <div className="ShopNowOverlay">
                                    Add To Cart <svg className="ChevronRightSVG" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                                </div>
                            </div>
                            <p className="PDescription">{`${product.team.teamName} ${product.shirtSeason} Jersey`}</p>
                            <p className="PPrice">{formatPrice(product.shirtPrice)}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default ProductHPage;
