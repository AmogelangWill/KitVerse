import { useState } from "react";
import "./Header.css";
import { Link } from "react-router-dom";
import AuthModal from "./AuthModal.jsx";
import SearchModal from "./SearchModal.jsx";
import CartDrawer from "./CartDrawer.jsx";
import { useAuth } from "./AuthContext.jsx";
import { useCart } from "./CartContext.jsx";

function Header(){
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    // Use our beautiful global contexts instead of hacky event listeners!
    const { user, logout, isAuthOpen, setIsAuthOpen } = useAuth();
    const { cartCount, isCartOpen, setIsCartOpen } = useCart();

    return(
      <>    
       <div className="HeaderContainer">
            
            <button className="HamburgerBtn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Menu">
                {isMobileMenuOpen ? (
                    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                ) : (
                    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="3" y1="12" x2="21" y2="12"></line>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                )}
            </button>

            <div className="Logo">
                <Link to="/" style={{ textDecoration: 'none' }}>
                    <h1 className="BrandName">
                        <img className="BrandImg" src="/logo.png" alt="KitVerse Logo" />
                    </h1>
                </Link>
            </div>
            
            <nav className={`NavButtons ${isMobileMenuOpen ? 'MobileOpen' : ''}`}>
                <Link to="/collections" style={{textDecoration: "none"}}><button className="NavBtn">Jerseys</button></Link>
                <Link to="/collections?filter=new" style={{textDecoration: "none"}}><button className="NavBtn">New Arrival</button></Link>
                <Link to="/collections" style={{textDecoration: "none"}}><button className="NavBtn">Nedbank Cup</button></Link>
                <Link to="/collections" style={{textDecoration: "none"}}><button className="NavBtn">CAF</button></Link>
                {user?.role === "Admin" && (
                    <Link to="/admin" className="HideOnMobile" style={{textDecoration: 'none'}}>
                        <button className="NavBtn" style={{color: '#ef4444', fontWeight: '800'}}>Admin Portal</button>
                    </Link>
                )}
                {(user?.role === "Admin" || user?.role === "Item Lister") && (
                    <Link to="/inventory" className="HideOnMobile" style={{textDecoration: 'none'}}>
                        <button className="NavBtn" style={{color: '#1d4ed8', fontWeight: '800'}}>Inventory</button>
                    </Link>
                )}

                {/* On mobile, we can also show the secondary links inside the menu */}
                <div className="MobileSecondaryLinks">
                    {user ? (
                        <>
                            <span className="NavBtn" style={{fontWeight: 800, color: '#111'}}>Hi, {user.userName}</span>
                            <button className="NavBtn" onClick={logout}>Sign Out</button>
                        </>
                    ) : (
                        <button className="NavBtn" onClick={() => { setIsAuthOpen(true); setIsMobileMenuOpen(false); }}>
                            Sign In / Register
                        </button>
                    )}
                    <button className="NavBtn">Wishlist</button>
                    {user?.role === "Admin" && (
                        <Link to="/admin" style={{textDecoration: 'none'}}>
                            <button className="NavBtn" style={{color: '#ef4444', fontWeight: '800'}}>Admin Portal</button>
                        </Link>
                    )}
                    {(user?.role === "Admin" || user?.role === "Item Lister") && (
                        <Link to="/inventory" style={{textDecoration: 'none'}}>
                            <button className="NavBtn" style={{color: '#1d4ed8', fontWeight: '800'}}>Inventory Portal</button>
                        </Link>
                    )}
                </div>
            </nav>

            <div className="Icons">
                <button className="IconBtn" aria-label="Search" onClick={() => setIsSearchOpen(true)}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="22" height="22">
                        <path d="M232.49,215.51,185,168a92.12,92.12,0,1,0-17,17l47.53,47.54a12,12,0,0,0,17-17ZM44,112a68,68,0,1,1,68,68A68.07,68.07,0,0,1,44,112Z" fill="currentColor"/>
                    </svg>
                </button>
                <button className="IconBtn HideOnMobile" aria-label="Wishlist">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>
                
                <div style={{ position: 'relative', display: 'inline-flex' }}>
                    <button className="IconBtn" aria-label="Shopping Bag" onClick={() => setIsCartOpen(true)}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none">
                            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M16 10a4 4 0 0 1-8 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                    {cartCount > 0 && (
                        <span className="CartBadge">{cartCount}</span>
                    )}
                </div>

                {user ? (
                    <button className="IconBtn HideOnMobile" aria-label="Sign Out" onClick={logout} title="Sign Out">
                        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                    </button>
                ) : (
                    <button className="IconBtn HideOnMobile" aria-label="Account" onClick={() => setIsAuthOpen(true)}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                )}
             </div>  
       </div>
       
       <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
       <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
       <CartDrawer />
     </>
    );
}
export default Header;
