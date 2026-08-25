import { useState, useEffect, useRef } from "react";
import "./SearchModal.css";

function SearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  // Auto-focus the input when the modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Small timeout ensures the transition is ready
      setTimeout(() => inputRef.current.focus(), 100);
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // This is where the backend team will trigger the search API
    console.log("Backend API Call -> Searching for:", query);
    // Optional: onClose();
  };

  const handleSuggestionClick = (term) => {
    setQuery(term);
    console.log("Backend API Call -> Searching for:", term);
  };

  if (!isOpen) return null;

  return (
    <div className="SearchOverlay" onClick={onClose}>
      <div className="SearchModalContainer" onClick={(e) => e.stopPropagation()}>
        
        <div className="SearchHeader">
          <form className="SearchForm" onSubmit={handleSubmit}>
            <svg className="SearchIcon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="28" height="28">
                <path d="M232.49,215.51,185,168a92.12,92.12,0,1,0-17,17l47.53,47.54a12,12,0,0,0,17-17ZM44,112a68,68,0,1,1,68,68A68.07,68.07,0,0,1,44,112Z" fill="currentColor"/>
            </svg>
            <input
              ref={inputRef}
              type="text"
              className="SearchInput"
              placeholder="Search for teams, players, or kits..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="button" className="SearchCloseBtn" onClick={onClose} aria-label="Close search">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </form>
        </div>

        <div className="SearchSuggestions">
          <h4 className="SuggestionsTitle">Popular Searches</h4>
          <div className="SuggestionsList">
            <button className="SuggestionPill" onClick={() => handleSuggestionClick("Real Madrid")}>Real Madrid</button>
            <button className="SuggestionPill" onClick={() => handleSuggestionClick("Retro Kits")}>Retro Kits</button>
            <button className="SuggestionPill" onClick={() => handleSuggestionClick("World Cup 2026")}>World Cup 2026</button>
            <button className="SuggestionPill" onClick={() => handleSuggestionClick("Arsenal")}>Arsenal</button>
            <button className="SuggestionPill" onClick={() => handleSuggestionClick("Messi")}>Messi</button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default SearchModal;
