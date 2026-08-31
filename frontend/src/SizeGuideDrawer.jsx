import "./SizeGuideDrawer.css";

function SizeGuideDrawer({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <>
            <div className={`SizeGuideOverlay ${isOpen ? 'open' : ''}`} onClick={onClose}></div>
            <div className={`SizeGuideDrawer ${isOpen ? 'open' : ''}`}>
                <div className="SizeGuideHeader">
                    <h3>Size guide</h3>
                    <button className="SizeGuideCloseBtn" onClick={onClose} aria-label="Close">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                <div className="SizeGuideContent">
                    <img 
                        src="/SIZE-GUIDE.png" 
                        alt="Size Guide Measurements" 
                        className="SizeGuideImage" 
                    />
                </div>
            </div>
        </>
    );
}

export default SizeGuideDrawer;
