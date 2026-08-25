import { useState } from "react";
import "./Header.css";
import AuthModal from "./AuthModal.jsx";
import SearchModal from "./SearchModal.jsx";

function Header(){
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    return(
      <>    
       <div className="HeaderContainer">
            
            <div className="Logo">
                <h1 className="BrandName">
                    <img className="BrandImg" src="/logo.png" alt="KitVerse Logo" />
                </h1>
            </div>
            
            <nav className="NavButtons">
                <button className="NavBtn">
                    Jerseys
                </button>
                <button className="NavBtn">
                    New Arrival
                </button>
                <button className="NavBtn">
                    Nedbank Cup
                    <svg className="DownArrow" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>
                <button className="NavBtn">
                    CAF
                    <svg className="DownArrow" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>
            </nav>
            <div className="Icons">
                <button className="IconBtn" aria-label="Search" onClick={() => setIsSearchOpen(true)}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="22" height="22">
                        <path d="M232.49,215.51,185,168a92.12,92.12,0,1,0-17,17l47.53,47.54a12,12,0,0,0,17-17ZM44,112a68,68,0,1,1,68,68A68.07,68.07,0,0,1,44,112Z" fill="currentColor"/>
                    </svg>
                </button>
                <button className="IconBtn" aria-label="Wishlist">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>
                <button className="IconBtn" aria-label="Shopping Bag">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none">
                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M16 10a4 4 0 0 1-8 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>
                <button className="IconBtn" aria-label="Account" onClick={() => setIsAuthOpen(true)}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>
             </div>  
       </div>
       
       <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
       <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
     </>
    );
}
export default Header;
