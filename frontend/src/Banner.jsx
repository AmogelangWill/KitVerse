import "./Banner.css"
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Banner() {
    const [banners, setBanners] = useState([]);
    const [CurrentBanner, setCurrentBanner] = useState(0);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

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

    useEffect(() => {
        if (banners.length === 0) return;
        const interval = setInterval(() => {
            setCurrentBanner((current) =>
                (current + 1) % banners.length
            );
        }, 5000); // 5 seconds is standard for ecommerce banners

        return () => clearInterval(interval);
    }, [banners.length]);

    const handleBannerClick = async (banner) => {
        if (!banner.team1ID && !banner.team2ID) return; // Unclickable banner

        try {
            // team1ID and team2ID in the banner model are actually TShirt IDs based on backend logic
            const id1 = banner.team1ID || 0;
            const id2 = banner.team2ID || 0;
            
            const res = await fetch(`https://kitverse-production.up.railway.app/api/TShirt/Banner/${id1}/${id2}`);
            if (res.ok) {
                const shirts = await res.json();
                if (shirts.length === 1) {
                    navigate(`/product/${shirts[0].tShirtId}`);
                } else if (shirts.length === 2) {
                    // Send to rivalry page with both shirt IDs
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
        // Fallback to default if database is empty
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
            <img 
                className="BannerImg" 
                src={currentData.bannerUrl} 
                alt={currentData.bannerName || `KitVerse Banner ${CurrentBanner + 1}`}
                onClick={() => handleBannerClick(currentData)}
                style={{ cursor: (currentData.team1ID || currentData.team2ID) ? 'pointer' : 'default' }}
            />
            
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
