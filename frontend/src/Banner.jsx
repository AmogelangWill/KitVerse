import "./Banner.css"

import { useState, useEffect } from "react";
function Banner(){
    const banners = [
        "https://sekbsdzqbykvocywwxsq.supabase.co/storage/v1/object/sign/Banners/Derby.png?token=eyJraWQiOiI3ZDk2N2Q0YS00ZDk5LTQwYWUtYWUzZS1hNjkwNTQ0MmRhZWYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJCYW5uZXJzL0RlcmJ5LnBuZyIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODg1NDA0MzMsImV4cCI6MTgyMDA3NjQzM30.wG0SLgMPYxUjBGMYhwffeYUSQ2GPkQoNk9EvxFCwMtg",
        "https://i.ibb.co/RkbYRsDJ/sundownsbanner.png",
         "https://i.ibb.co/whpBRHQq/banner3.png",
        "https://i.ibb.co/HfLx1vsk/banner1.png"
        
    const [CurrentBanner, setCurrentBanner] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentBanner((current) =>
                (current + 1) % banners.length
            );
        }, 3500);

        return () => clearInterval(interval);
    }, [banners.length]);

    return (
        <div className="BannerContainer">
            <img 
                className="BannerImg" 
                src={banners[CurrentBanner]} 
                alt={`KitVerse Promotional Banner ${CurrentBanner + 1}`}
            />
            
            <div className="Indicators">
                {banners.map((_, index) => (
                    <button 
                        key={index}
                        className={CurrentBanner === index ? "Indicator active" : "Indicator"}
                        onClick={() => setCurrentBanner(index)}
                        aria-label={`Slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
     
}
export default Banner
