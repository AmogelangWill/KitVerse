import { useState } from "react";
import "./Footer.css";
import { VisaIcon, MastercardIcon, ApplePayIcon, PayPalIcon } from "./PaymentIcons.jsx";
import { useToast } from "./ToastContext.jsx";

// Global site footer containing newsletter subscription, customer support links, and accepted payment badges
function Footer() {
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  // Handles the newsletter form submission to the backend API
  const handleSubscribe = async () => {
    if (!email) {
      showToast("Please enter an email address", "error");
      return;
    }
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "https://kitverse-production.up.railway.app";
      const response = await fetch(`${apiUrl}/api/Newsletter/subscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      });
      
      if (response.ok) {
        showToast("Successfully subscribed to newsletter!", "success");
        setEmail("");
      } else {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.message || await response.text() || "Failed to subscribe";
        showToast(errorMessage, "error");
      }
    } catch (error) {
      console.error("Newsletter error:", error);
      showToast("Network error. Please try again later.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="FooterContainer">
      {/* Newsletter signup banner */}
      <div className="FooterTop">
        <div className="NewsletterSection">
          <h3 className="NewsletterTitle">Subscribe to Newsletter</h3>
          <p className="NewsletterDesc">
            Get early access to new arrivals, exclusive discounts, and seasonal style updates.
          </p>
          <div className="NewsletterForm">
            <input 
              type="email" 
              placeholder="" 
              className="NewsletterInput" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSubscribe(); }}
            />
            <button className="NewsletterBtn" onClick={handleSubscribe} disabled={loading}>
              {loading ? "..." : "Subscribe"}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation links and social icons */}
      <div className="FooterMain">
        <div className="FooterColumn">
          <h4 className="ColumnTitle">Customers</h4>
          <a href="#" className="FooterLink">My Account</a>
          <a href="#" className="FooterLink">About Us</a>
          <a href="#" className="FooterLink">Sell Your Collection</a>
          <a href="#" className="FooterLink">Help Center</a>
          <a href="#" className="FooterLink">Track Your Orders</a>
          <a href="#" className="FooterLink">Create Return</a>
        </div>

        <div className="FooterColumn">
          <h4 className="ColumnTitle">Collections</h4>
          <a href="#" className="FooterLink">New Arrivals</a>
          <a href="#" className="FooterLink">Seasonal Drop</a>
          <a href="#" className="FooterLink">Best Clubs</a>
          <a href="#" className="FooterLink">National Teams</a>
          <a href="#" className="FooterLink">Classic Kits</a>
        </div>

        <div className="FooterColumn">
          <h4 className="ColumnTitle">Social Media</h4>
          <div className="SocialIcons">
            <a href="#" aria-label="Facebook">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"/>
              </svg>
            </a>
            <a href="#" aria-label="Instagram">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm3.98-10.395a1.44 1.44 0 100-2.88 1.44 1.44 0 000 2.88z"/>
              </svg>
            </a>
            <a href="#" aria-label="X (Twitter)">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Accepted Payment Methods */}
        <div className="FooterColumn">
          <h4 className="ColumnTitle">Payment Methods</h4>
          <div className="PaymentMethods">
            <VisaIcon />
            <MastercardIcon />
            <ApplePayIcon />
            <PayPalIcon />
          </div>
        </div>
      </div>

      <div className="FooterBottom">
        <img className="FooterLogo" src="/logo.png" alt="KitVerse Logo" />
        <p className="CopyrightText">© 2026 KitVerse. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
