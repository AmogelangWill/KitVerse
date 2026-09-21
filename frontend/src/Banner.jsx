import "./Banner.css"
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Promotional hero carousel component displayed at the top of the homepage
function Banner() {
    const [banners, setBanners] = useState([]);
    const [CurrentBanner, setCurrentBanner] = useState(0);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Fetch promotional banners on component mount
    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const res = await fetch("https://kitverse-production.up.railway.app/api/Admin/banners");
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.length > 0) {
                        setBanners(data);
                    }
                }
            } catch (err) {
                console.error("Failed to load banners:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchBanners();
    }, []);

    // Rotate carousel to the next slide every 5 seconds
    useEffect(() => {
        if (banners.length === 0) return;
        const interval = setInterval(() => {
            setCurrentBanner((current) =>
                (current + 1) % banners.length
            );
        }, 5000);

        return () => clearInterval(interval);
    }, [banners.length]);

    // Handles banner clicks by redirecting to single product or rivalry comparison page
    const handleBannerClick = async (banner) => {
        if (!banner.team1ID && !banner.team2ID) return;

        try {
            const id1 = banner.team1ID || 0;
            const id2 = banner.team2ID || 0;
            
            const res = await fetch(`https://kitverse-production.up.railway.app/api/TShirt/Banner/${id1}/${id2}`);
            if (res.ok) {
                const shirts = await res.json();
                if (shirts.length === 1) {
                    navigate(`/product/${shirts[0].tShirtId}`);
                } else if (shirts.length === 2) {
                    navigate(`/rivalry/${shirts[0].tShirtId}/${shirts[1].tShirtId}`);
                }
            }
        } catch (err) {
            console.error("Banner click error:", err);
        }
    };

    if (loading) {
        return <div className="BannerContainer" style={{background: '#e5e7eb', animation: 'pulse 2s infinite'}}></div>;
    }

    if (banners.length === 0) {
        return (
            <div className="BannerContainer">
                <img 
                    className="BannerImg" 
                    src="https://i.ibb.co/whpBRHQq/banner3.png" 
                    alt="KitVerse Default Banner"
                />
            </div>
        );
    }

    const currentData = banners[CurrentBanner];

    return (
        <div className="BannerContainer">
            {/* Active banner image */}
            <img 
                className="BannerImg" 
                src={currentData.bannerUrl} 
                alt={currentData.bannerName || `KitVerse Banner ${CurrentBanner + 1}`}
                onClick={() => handleBannerClick(currentData)}
                style={{ cursor: (currentData.team1ID || currentData.team2ID) ? 'pointer' : 'default' }}
            />
            
            {/* Pagination indicator dots */}
            {banners.length > 1 && (
                <div className="Indicators">
                    {banners.map((_, index) => (
                        <button 
                            key={index}
                            className={CurrentBanner === index ? "Indicator active" : "Indicator"}
                            onClick={(e) => { e.stopPropagation(); setCurrentBanner(index); }}
                            aria-label={`Slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default Banner;
