import "./Banner.css"

import { useState, useEffect } from "react";
function Banner(){
    const banners=[
        "https://i.ibb.co/Q7qpPRDc/banner.png",
        "banner2.webp",
        "https://kcpub.azureedge.net/storage/uploads/public/6a4/f29/38d/6a4f2938dbe52674005216.jpg",
        "https://i0.wp.com/sundayworld-prod-s3-bucket.s3.eu-west-1.amazonaws.com/wp-content/uploads/2026/08/06103254/downs-away-kit-scaled.jpg?fit=2560%2C1708&ssl=1"
        
    ];
    const [CurrentBanner,setCurrentBanner]=useState(0);
    useEffect(() => {

                const interval = setInterval(() => {

                    setCurrentBanner((current) =>
                        (current + 1) % banners.length
                    );

                }, 3500);

                return () => clearInterval(interval);

            }, []);
    return(
        <div className="BannerContainer">

            <img className="BannerImg" src={banners[CurrentBanner]}/>

            
            <div className="Indicators">
                <button className={CurrentBanner===0? "Indicator active":"Indicator"}
                     onClick={() => setCurrentBanner(0)}>

                </button>
                 <button className={CurrentBanner===1? "Indicator active":"Indicator"}
                     onClick={() => setCurrentBanner(1)}>

                </button>
                 <button className={CurrentBanner===2? "Indicator active":"Indicator"}
                     onClick={() => setCurrentBanner(2)}>

                </button>
                <button className={CurrentBanner===3? "Indicator active":"Indicator"}
                     onClick={() => setCurrentBanner(3)}>

                </button>
            </div>
        </div>
    );
     
}
export default Banner