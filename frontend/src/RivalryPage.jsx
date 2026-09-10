import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./RivalryPage.css";

function RivalryPage() {
    const { id1, id2 } = useParams();
    const navigate = useNavigate();
    const [shirt1, setShirt1] = useState(null);
    const [shirt2, setShirt2] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRivalryShirts = async () => {
            try {
                const res = await fetch(`https://kitverse-production.up.railway.app/api/TShirt/Banner/${id1}/${id2}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.length === 2) {
                        // Keep the order based on the URL params
                        const s1 = data.find(s => s.tShirtId.toString() === id1) || data[0];
                        const s2 = data.find(s => s.tShirtId.toString() === id2) || data[1];
                        setShirt1(s1);
                        setShirt2(s2);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch rivalry shirts", err);
            } finally {
                setLoading(false);
            }
        };

        if (id1 && id2) {
            fetchRivalryShirts();
        }
    }, [id1, id2]);

    if (loading) {
        return <div className="RivalryContainer"><h2>Loading Rivalry...</h2></div>;
    }

    if (!shirt1 || !shirt2) {
        return (
            <div className="RivalryContainer">
                <h2>Rivalry Not Found</h2>
                <button className="RivalryBtn" onClick={() => navigate('/')}>Return Home</button>
            </div>
        );
    }

    return (
        <div className="RivalryContainer">
            <h1 className="RivalryTitle">CHOOSE YOUR <span>SIDE</span></h1>
            
            <div className="RivalrySplitScreen">
                <div className="RivalryCard" onClick={() => navigate(`/product/${shirt1.tShirtId}`)}>
                    <img 
                        src={shirt1.shirtLinks?.[0]?.shirtLinkUrl || "/placeholder.png"} 
                        alt={shirt1.shirtName} 
                    />
                    <h2>{shirt1.shirtName.replace(/_/g, " ")}</h2>
                    <p>R {shirt1.shirtPrice.toFixed(2)}</p>
                    <button className="RivalryBtn">Select {shirt1.shirtName.split('_')[0]}</button>
                </div>

                <div className="RivalryCard" onClick={() => navigate(`/product/${shirt2.tShirtId}`)}>
                    <img 
                        src={shirt2.shirtLinks?.[0]?.shirtLinkUrl || "/placeholder.png"} 
                        alt={shirt2.shirtName} 
                    />
                    <h2>{shirt2.shirtName.replace(/_/g, " ")}</h2>
                    <p>R {shirt2.shirtPrice.toFixed(2)}</p>
                    <button className="RivalryBtn">Select {shirt2.shirtName.split('_')[0]}</button>
                </div>
            </div>
        </div>
    );
}

export default RivalryPage;
