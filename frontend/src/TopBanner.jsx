import "./TopBanner.css";

function TopBanner() {
  return (
    <div className="TopBannerContainer">
      <div className="TopBannerContent">
        <h2 className="TopBannerTitle">THE HOME OF AUTHENTIC KITS</h2>
        <p className="TopBannerDesc">
          Discover Authentic Football Jerseys and Official Club Collections for Every Passionate Football Fan
        </p>
        <div className="TopBannerActions">
          <button className="TopBannerBtn">More About Us</button>
          <button className="TopBannerBtn outline">Contact Now</button>
        </div>
      </div>
    </div>
  );
}

export default TopBanner;
