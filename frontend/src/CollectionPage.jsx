import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./CollectionPage.css";
import "./ProductsPage.css";

// Store catalog page with multi-facet filtering for teams, competitions, and new arrivals
function CollectionPage() {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Catalog data state
    const [allShirts, setAllShirts] = useState([]);
    const [filteredShirts, setFilteredShirts] = useState([]);
    const [competitions, setCompetitions] = useState([]);
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter query parameters
    const searchParams = new URLSearchParams(location.search);
    const initialFilter = searchParams.get('filter');
    const initialCompetition = searchParams.get('competition');
    const initialTeam = searchParams.get('team');

    const [selectedCompetitions, setSelectedCompetitions] = useState(initialCompetition ? [parseInt(initialCompetition)] : []);
    const [selectedTeams, setSelectedTeams] = useState(initialTeam ? [parseInt(initialTeam)] : []);
    const [isNewArrivals, setIsNewArrivals] = useState(initialFilter === 'new');
    const [sortOrder, setSortOrder] = useState("");

    // Synchronizes component filter state with URL parameters
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        
        setIsNewArrivals(params.get('filter') === 'new');
        
        const comp = params.get('competition');
        if (comp) setSelectedCompetitions([parseInt(comp)]);
        
        const compName = params.get('competitionName');
        if (compName && competitions.length > 0) {
            const matched = competitions.find(c => c.competitionName.toLowerCase().includes(compName.toLowerCase()));
            if (matched) {
                setSelectedCompetitions([matched.competitionId]);
            }
        }
        
        // Reset filters when navigating to base collections without query params
        if (!location.search) {
            setSelectedCompetitions([]);
            setSelectedTeams([]);
            setIsNewArrivals(false);
        }
    }, [location.search, competitions]);

    // Loads catalog shirts and competition list on mount
    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                // Fetch catalog inventory
                const shirtRes = await fetch("https://kitverse-production.up.railway.app/api/TShirt");
                let shirtsData = [];
                if (shirtRes.ok) {
                    shirtsData = await shirtRes.json();
                    setAllShirts(shirtsData);
                    
                    // Deduplicate teams from returned shirts
                    const uniqueTeams = Array.from(new Map(shirtsData.filter(t => t.team).map(t => [t.team.teamId, t.team])).values());
                    setTeams(uniqueTeams);
                }

                // Fetch available competitions
                let compsData = [];
                const compRes = await fetch("https://kitverse-production.up.railway.app/api/TShirt/competitions");
                if (compRes.ok) {
                    compsData = await compRes.json();
                    setCompetitions(compsData);
                }

                // Pre-select competition if specified by name in query string
                const params = new URLSearchParams(window.location.search);
                const compName = params.get('competitionName');
                if (compName && compsData.length > 0) {
                    const matched = compsData.find(c => c.competitionName.toLowerCase().includes(compName.toLowerCase()));
                    if (matched) {
                        setSelectedCompetitions([matched.competitionId]);
                    }
                }

            } catch (error) {
                console.error("Error fetching collection data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    // Recomputes filtered shirt list whenever active filters or sort criteria change
    useEffect(() => {
        if (allShirts.length === 0) return;

        const applyFilters = async () => {
            setLoading(true);
            let result = [...allShirts];

            try {
                // Filter by new arrivals
                if (isNewArrivals) {
                    const newRes = await fetch("https://kitverse-production.up.railway.app/api/TShirt/new");
                    if (newRes.ok) {
                        const newArrivals = await newRes.json();
                        const newIds = newArrivals.map(s => s.tShirtId);
                        result = result.filter(s => newIds.includes(s.tShirtId));
                    }
                }

                // Filter by selected teams
                if (selectedTeams.length > 0) {
                    result = result.filter(s => selectedTeams.includes(s.teamId));
                }

                // Filter by selected competitions
                if (selectedCompetitions.length > 0) {
                    let compValidIds = new Set();
                    for (const compId of selectedCompetitions) {
                        const compRes = await fetch(`https://kitverse-production.up.railway.app/api/TShirt/competition/${compId}`);
                        if (compRes.ok) {
                            const compShirts = await compRes.json();
                            compShirts.forEach(cs => compValidIds.add(cs.tShirtId));
                        }
                    }
                    result = result.filter(s => compValidIds.has(s.tShirtId));
                }

                // Apply price sorting
                if (sortOrder === "price_asc") {
                    result.sort((a, b) => a.shirtPrice - b.shirtPrice);
                } else if (sortOrder === "price_desc") {
                    result.sort((a, b) => b.shirtPrice - a.shirtPrice);
                }

                setFilteredShirts(result);
            } catch (err) {
                console.error("Filtering error:", err);
            } finally {
                setLoading(false);
            }
        };

        applyFilters();
    }, [allShirts, selectedCompetitions, selectedTeams, isNewArrivals, sortOrder]);

    // Toggles a team checkbox filter
    const handleTeamToggle = (teamId) => {
        setSelectedTeams(prev => 
            prev.includes(teamId) ? prev.filter(id => id !== teamId) : [...prev, teamId]
        );
    };

    // Toggles a competition checkbox filter
    const handleCompToggle = (compId) => {
        setSelectedCompetitions(prev => 
            prev.includes(compId) ? prev.filter(id => id !== compId) : [...prev, compId]
        );
    };

    // Formats a numeric price into South African Rand currency string
    const formatPrice = (price) => {
        return `R${price.toFixed(2)}`;
    };

    // Clears all active filters and resets query parameters
    const clearFilters = () => {
        setSelectedTeams([]);
        setSelectedCompetitions([]);
        setIsNewArrivals(false);
        navigate('/collections', { replace: true });
    };

    return (
        <div className="CollectionPageContainer">
            {/* Filter sidebar */}
            <aside className="CollectionSidebar">
                <div className="SidebarHeader">Filters</div>
                
                <div className="FilterSection">
                    <h3>Collection</h3>
                    <label className="FilterOption">
                        <input 
                            type="checkbox" 
                            checked={isNewArrivals} 
                            onChange={() => setIsNewArrivals(!isNewArrivals)}
                        />
                        New Arrivals
                    </label>
                </div>

                {competitions.length > 0 && (
                    <div className="FilterSection">
                        <h3>Competitions</h3>
                        {competitions.map(comp => (
                            <label className="FilterOption" key={comp.competitionId}>
                                <input 
                                    type="checkbox" 
                                    checked={selectedCompetitions.includes(comp.competitionId)}
                                    onChange={() => handleCompToggle(comp.competitionId)}
                                />
                                {comp.competitionName}
                            </label>
                        ))}
                    </div>
                )}

                <div className="FilterSection">
                    <h3>Teams</h3>
                    {teams.map(team => (
                        <label className="FilterOption" key={team.teamId}>
                            <input 
                                type="checkbox" 
                                checked={selectedTeams.includes(team.teamId)}
                                onChange={() => handleTeamToggle(team.teamId)}
                            />
                            {team.teamName}
                        </label>
                    ))}
                </div>
            </aside>

            {/* Main products grid and active filter pills */}
            <main className="CollectionContent">
                <div className="CollectionTopBar">
                    <div className="ActiveFilters">
                        <span style={{fontWeight: 700, fontSize: '1.2rem', marginRight: '15px'}}>
                            {filteredShirts.length} Products
                        </span>
                        
                        {isNewArrivals && (
                            <span className="FilterTag">
                                New Arrivals <button onClick={() => setIsNewArrivals(false)}>×</button>
                            </span>
                        )}
                        {selectedCompetitions.map(id => {
                            const comp = competitions.find(c => c.competitionId === id);
                            return comp ? (
                                <span className="FilterTag" key={id}>
                                    {comp.competitionName} <button onClick={() => handleCompToggle(id)}>×</button>
                                </span>
                            ) : null;
                        })}
                        {selectedTeams.map(id => {
                            const team = teams.find(t => t.teamId === id);
                            return team ? (
                                <span className="FilterTag" key={id}>
                                    {team.teamName} <button onClick={() => handleTeamToggle(id)}>×</button>
                                </span>
                            ) : null;
                        })}
                        
                        {(isNewArrivals || selectedCompetitions.length > 0 || selectedTeams.length > 0) && (
                            <button className="ClearAllBtn" onClick={clearFilters}>Clear All</button>
                        )}
                    </div>

                    <div>
                        <select className="SortSelect" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                            <option value="">Sort By: Default</option>
                            <option value="price_asc">Price: Low to High</option>
                            <option value="price_desc">Price: High to Low</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div style={{padding: '50px', textAlign: 'center', fontWeight: 'bold'}}>Applying filters...</div>
                ) : filteredShirts.length === 0 ? (
                    <div style={{padding: '50px', textAlign: 'center'}}>
                        <h3>No products match your filters.</h3>
                        <p style={{color: '#6b7280', marginTop: '10px'}}>Try removing some filters to see more results.</p>
                    </div>
                ) : (
                    <div className="CollectionGrid">
                        {filteredShirts.map((product) => (
                            <div className="Product" key={product.tShirtId} onClick={() => navigate(`/product/${product.tShirtId}`)} style={{ cursor: "pointer", width: '100%' }}>
                                <div className="ProductImgWrapper" style={{height: '280px'}}>
                                    <img
                                        className="ProductImg"
                                        src={product.shirtLinks && product.shirtLinks.length > 0 ? product.shirtLinks[0].shirtLinkUrl : "/placeholder.png"}
                                        alt={`${product.shirtName} Jersey`}
                                        loading="lazy"
                                        style={{objectFit: 'contain'}}
                                    />
                                    <div className="ShopNowOverlay">
                                        View Details <svg className="ChevronRightSVG" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                <polyline points="12 5 19 12 12 19"></polyline>
                            </svg>
                                    </div>
                                </div>
                                <p className="PDescription" style={{marginTop: '15px'}}>{`${product.team?.teamName || product.shirtName.replace(/_/g, ' ')} ${product.shirtSeason || ''}`}</p>
                                <p className="PPrice">{formatPrice(product.shirtPrice)}</p>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

export default CollectionPage;
