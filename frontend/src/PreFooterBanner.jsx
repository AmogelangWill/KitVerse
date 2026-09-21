import "./PreFooterBanner.css";

// Store value proposition banner displaying delivery promises, warranty, and security perks
function PreFooterBanner() {
  return (
    <div className="PreFooterContainer">
      <div className="PreFooterHero">
        <h2 className="PreFooterTitle">THE HOME OF AUTHENTIC KITS</h2>
        <p className="PreFooterDesc">
          Discover Authentic Football Jerseys and Official Club Collections for Every Passionate Football Fan
        </p>
        <div className="PreFooterActions">
          <button className="PreFooterBtn">More About Us</button>
          <button className="PreFooterBtn outline">Contact Now</button>
        </div>
      </div>
      
      {/* Key customer assurance guarantees */}
      <div className="PreFooterFeatures">
        <div className="FeatureItem">
          <svg className="FeatureIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="3" width="15" height="13"></rect>
            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
            <circle cx="5.5" cy="18.5" r="2.5"></circle>
            <circle cx="18.5" cy="18.5" r="2.5"></circle>
          </svg>
          <span className="FeatureText">Free shipping over R1 500</span>
        </div>
        <div className="FeatureItem">
          <svg className="FeatureIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <span className="FeatureText">Easy returns within 30 days</span>
        </div>
        <div className="FeatureItem">
          <svg className="FeatureIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          <span className="FeatureText">100% Secure Payments</span>
        </div>
        <div className="FeatureItem">
          <svg className="FeatureIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <span className="FeatureText">24/7 customer support</span>
        </div>
      </div>
    </div>
  );
}

export default PreFooterBanner;
