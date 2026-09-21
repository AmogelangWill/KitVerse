import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./ProductsPage.css";

// Page displaying two featured kits side-by-side from a promotional derby or rivalry banner
function RivalryPage() {
    const { id1, id2 } = useParams();
    const navigate = useNavigate();
    const [shirts, setShirts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetches the pair of kits associated with the banner click
    useEffect(() => {
        const fetchRivalryShirts = async () => {
            try {
                const res = await fetch(`https://kitverse-production.up.railway.app/api/TShirt/Banner/${id1}/${id2}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.length === 2) {
                        const s1 = data.find(s => s.tShirtId.toString() === id1) || data[0];
                        const s2 = data.find(s => s.tShirtId.toString() === id2) || data[1];
                        setShirts([s1, s2]);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch rivalry shirts:", err);
            } finally {
                setLoading(false);
            }
        };

        if (id1 && id2) {
            fetchRivalryShirts();
        }
    }, [id1, id2]);

    // Formats numeric price into South African Rand currency representation
    const formatPrice = (price) => {
        return `R${price.toFixed(2)}`;
    };

    if (loading) {
        return <div className="BodyWrapper"><p style={{padding: '100px 20px', textAlign: 'center'}}>Loading Collection...</p></div>;
    }

    if (shirts.length !== 2) {
        return (
            <div className="BodyWrapper">
                <p style={{padding: '100px 20px', textAlign: 'center'}}>Collection not found.</p>
            </div>
        );
    }

    return (
        <div className="BodyWrapper" style={{ paddingTop: '40px', minHeight: '60vh' }}>
            <div className="Description">
                <h2 className="DOutliner">
                    FEATURED COLLECTION
                </h2>
                <div className="FilterDiv">
                    <button className="BtnFilter" onClick={() => navigate('/collections')}>
                        <span className="FilterText">All Collections</span>
                        <svg className="ChevronRightSVG" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                    </button>
                </div>
            </div>

            <div className="ProductsContainer">
                {shirts.map((product) => (
                    <div className="Product" key={product.tShirtId} onClick={() => navigate(`/product/${product.tShirtId}`)} style={{ cursor: "pointer" }}>
                        <div className="ProductImgWrapper">
                            <img
                                className="ProductImg"
                                src={product.shirtLinks && product.shirtLinks.length > 0 ? product.shirtLinks[0].shirtLinkUrl : "/placeholder.png"}
                                alt={`${product.team?.teamName || product.shirtName} Jersey`}
                                loading="lazy"
                            />
                            <div className="ShopNowOverlay">
                                Add To Cart <svg className="ChevronRightSVG" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                            </div>
                        </div>
                        <p className="PDescription">{`${product.team?.teamName || product.shirtName.replace(/_/g, ' ')} ${product.shirtSeason || ''} Jersey`}</p>
                        <p className="PPrice">{formatPrice(product.shirtPrice)}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default RivalryPage;
