import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./SearchModal.css";

function SearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Auto-focus the input when the modal opens
  useEffect(() => {
    if (isOpen) {
      if (inputRef.current) {
        setTimeout(() => inputRef.current.focus(), 100);
      }
    } else {
      // Clear on close
      setQuery("");
      setResults([]);
    }
  }, [isOpen]);

  // Debounced search API call
  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      
      setLoading(true);
      try {
        const res = await fetch(`https://kitverse-production.up.railway.app/api/Search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        } else {
          setResults([]);
        }
      } catch (err) {
        console.error("Search error", err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchResults, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
       // Optional: Navigate to a dedicated search page or just rely on the live dropdown results
       // navigate(`/collections?search=${encodeURIComponent(query)}`);
       // onClose();
    }
  };

  const handleSuggestionClick = (term) => {
    setQuery(term);
  };

  const handleResultClick = (id) => {
    navigate(`/product/${id}`);
    onClose();
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

        {query.trim() ? (
          <div className="SearchResultsContainer">
            {loading ? (
              <div className="SearchLoading">Searching...</div>
            ) : results.length > 0 ? (
              <div className="SearchResults">
                {results.map(shirt => {
                  const imageUrl = shirt.shirtLinks && shirt.shirtLinks.length > 0 
                    ? shirt.shirtLinks.find(l => l.isMain)?.shirtLinkUrl || shirt.shirtLinks[0].shirtLinkUrl 
                    : "";
                  return (
                    <div 
                      key={shirt.tShirtId} 
                      className="SearchResultItem" 
                      onClick={() => handleResultClick(shirt.tShirtId)}
                      style={{cursor: 'pointer'}}
                    >
                      {imageUrl && <img src={imageUrl} alt={shirt.shirtName} className="SearchResultImage" />}
                      <div className="SearchResultInfo">
                        <span className="SearchResultName">{shirt.shirtName}</span>
                        <span className="SearchResultTeam">{shirt.team?.teamName || shirt.shirtSeason}</span>
                        <span className="SearchResultPrice">R{shirt.shirtPrice}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="SearchLoading">No results found for "{query}"</div>
            )}
          </div>
        ) : (
          <div className="SearchSuggestions">
            <h4 className="SuggestionsTitle">Popular Searches</h4>
            <div className="SuggestionsList">
              <button className="SuggestionPill" onClick={() => handleSuggestionClick("Mamelodi Sundowns")}>Mamelodi Sundowns</button>
              <button className="SuggestionPill" onClick={() => handleSuggestionClick("Retro Kits")}>Retro Kits</button>
              <button className="SuggestionPill" onClick={() => handleSuggestionClick("Orlando Pirates")}>Orlando Pirates</button>
              <button className="SuggestionPill" onClick={() => handleSuggestionClick("Kaizer Chiefs")}>Kaizer Chiefs</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default SearchModal;
