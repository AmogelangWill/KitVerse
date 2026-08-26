import "./Banner.css"

import { useState, useEffect } from "react";
function Banner(){
    const banners = [
       
        "https://i.ibb.co/RkbYRsDJ/sundownsbanner.png",
         "https://i.ibb.co/whpBRHQq/banner3.png",
        "https://i.ibb.co/HfLx1vsk/banner1.png"
        //"https://i0.wp.com/sundayworld-prod-s3-bucket.s3.eu-west-1.amazonaws.com/wp-content/uploads/2026/08/06103254/downs-away-kit-scaled.jpg?fit=2560%2C1708&ssl=1"
    ];
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
