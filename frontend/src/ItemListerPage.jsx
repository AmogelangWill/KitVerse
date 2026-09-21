import { useState, useEffect } from "react";
import { useAuth } from "./AuthContext.jsx";
import { useToast } from "./ToastContext.jsx";
import ImageUploader from "./ImageUploader.jsx";
import { Link } from "react-router-dom";
import "./AdminPage.css";
import "./ItemListerPage.css";

// Portal page enabling Item Listers and Admins to manage and add catalog kits
function ItemListerPage() {
    const { user, loading: authLoading, logout } = useAuth();
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState("inventory");
    const [inventory, setInventory] = useState([]);
    const [competitions, setCompetitions] = useState([]);
    const [selectedCompetitions, setSelectedCompetitions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);

    // Form inputs state
    const [formData, setFormData] = useState({
        tShirtId: 0,
        shirtName: "",
        shirtSeason: "",
        shirtPrice: "",
        shirtAffiliate: "",
        shirtGender: "Unisex",
        shirtDescription: "",
        shirtStatus: "Available",
        teamId: ""
    });
    const [imageUrls, setImageUrls] = useState([""]);
    const [sizes, setSizes] = useState([{ shirtSize: "M", amountAvailable: 10 }]);
    const [stockAdjustments, setStockAdjustments] = useState([{ shirtSize: "M", amount: 0 }]);

    const isAuthorized = user && (user.role === "Admin" || user.role === "Item Lister");

    // Fetch existing shirts and competition tags when accessing inventory
    useEffect(() => {
        if (isAuthorized && activeTab === "inventory") {
            fetchInventory();
        }
    }, [isAuthorized, activeTab]);

    // Loads current inventory and available competitions from the API
    const fetchInventory = async () => {
        setLoading(true);
        try {
            const res = await fetch("https://kitverse-production.up.railway.app/api/TShirt");
            if (res.ok) setInventory(await res.json());
            
            const compRes = await fetch("https://kitverse-production.up.railway.app/api/TShirt/competitions");
            if (compRes.ok) setCompetitions(await compRes.json());
        } catch (err) {
            console.error("Error fetching inventory:", err);
        } finally {
            setLoading(false);
        }
    };

    // Synchronizes form input changes with state
    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Updates image URL at a specific index
    const handleImageChange = (index, value) => {
        const newImages = [...imageUrls];
        newImages[index] = value;
        setImageUrls(newImages);
    };

    // Updates size name or available stock count in the sizes array
    const handleSizeChange = (index, field, value) => {
        const newSizes = [...sizes];
        newSizes[index][field] = field === "amountAvailable" ? parseInt(value) || 0 : value;
        setSizes(newSizes);
    };

    // Resets form inputs, image slots, and size selections back to defaults
    const resetForm = () => {
        setFormData({
            tShirtId: 0, shirtName: "", shirtSeason: "", shirtPrice: "", shirtAffiliate: "",
            shirtGender: "Unisex", shirtDescription: "", shirtStatus: "Available", teamId: ""
        });
        setImageUrls([""]);
        setSizes([{ shirtSize: "M", amountAvailable: 10 }]);
        setStockAdjustments([{ shirtSize: "M", amount: 0 }]);
        setSelectedCompetitions([]);
    };

    // Opens edit view and pre-populates fields with existing item values
    const openEditForm = (item) => {
        setFormData({
            tShirtId: item.tShirtId,
            shirtName: item.shirtName || "",
            shirtSeason: item.shirtSeason || "",
            shirtPrice: item.shirtPrice || "",
            shirtAffiliate: item.shirtAffiliate || "",
            shirtGender: item.shirtGender || "Unisex",
            shirtDescription: item.shirtDescription || "",
            shirtStatus: item.shirtStatus || "Available",
            teamId: item.teamId || ""
        });
        
        if (item.shirtLinks && item.shirtLinks.length > 0) {
            setImageUrls(item.shirtLinks.map(link => link.shirtLinkUrl));
        } else {
            setImageUrls([""]);
        }
        
        setSizes([{ shirtSize: "M", amountAvailable: 10 }]);
        setStockAdjustments([{ shirtSize: "M", amount: 0 }]);
        setSelectedCompetitions([]);
        setActiveTab("edit");
    };

    // Submits product creation or updates, applies stock adjustments, and links competitions
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);

        const isEdit = activeTab === "edit";

        const payload = isEdit ? {
            tShirtId: formData.tShirtId,
            shirtName: formData.shirtName,
            shirtSeason: formData.shirtSeason,
            shirtPrice: parseFloat(formData.shirtPrice),
            shirtAffiliate: formData.shirtAffiliate,
            shirtGender: formData.shirtGender,
            shirtDescription: formData.shirtDescription,
            shirtStatus: formData.shirtStatus,
            teamId: parseInt(formData.teamId),
            imageUrls: imageUrls.filter(url => url.trim() !== ""),
            team: { teamId: parseInt(formData.teamId), teamName: "Bypass", teamLeague: "Bypass" },
            tShirtCompetitions: [],
            reviews: []
        } : {
            shirtName: formData.shirtName,
            shirtSeason: formData.shirtSeason,
            shirtPrice: parseFloat(formData.shirtPrice),
            shirtAffiliate: formData.shirtAffiliate,
            shirtGender: formData.shirtGender,
            shirtDescription: formData.shirtDescription,
            shirtStatus: formData.shirtStatus,
            teamId: parseInt(formData.teamId),
            imageUrls: imageUrls.filter(url => url.trim() !== ""),
            sizes: sizes.filter(s => s.shirtSize.trim() !== "")
        };

        const url = isEdit 
            ? "https://kitverse-production.up.railway.app/api/TShirt/Tshirt"
            : "https://kitverse-production.up.railway.app/api/TShirt";

        try {
            const res = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${user.token}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const data = await res.json();
                const createdShirtId = isEdit ? formData.tShirtId : (data.tShirtId || data.id);

                // Apply relative stock adjustments when editing an existing product
                if (isEdit) {
                    const validAdjustments = stockAdjustments
                        .filter(adj => adj.amount !== 0)
                        .map(adj => ({
                            shirtId: createdShirtId,
                            shirtSize: adj.shirtSize,
                            amount: adj.amount
                        }));
                    
                    if (validAdjustments.length > 0) {
                        const stockRes = await fetch("https://kitverse-production.up.railway.app/api/TShirt/StockUpdate", {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${user.token}`
                            },
                            body: JSON.stringify(validAdjustments)
                        });
                        if (stockRes.ok) {
                            const stockData = await stockRes.json();
                            if (Array.isArray(stockData) && stockData.length > 0) {
                                showToast("Some stock sizes could not be adjusted because they do not exist.", "warning");
                            }
                        }
                    }
                }

                // Link shirt to selected competitions
                if (createdShirtId && selectedCompetitions.length > 0) {
                    for (const compId of selectedCompetitions) {
                        try {
                            await fetch("https://kitverse-production.up.railway.app/api/TShirt/competition", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                    "Authorization": `Bearer ${user?.token}`
                                },
                                body: JSON.stringify({ tShirtId: createdShirtId, competitionId: compId })
                            });
                        } catch (err) {
                            console.error("Failed to link competition:", err);
                        }
                    }
                }

                showToast(`Product successfully ${isEdit ? 'updated' : 'added'}!`, 'success');

                setActiveTab("inventory");
                fetchInventory();
                resetForm();
            } else if (res.status === 401 || res.status === 403) {
                showToast("Your session has expired. You are being logged out.", "error");
                logout();
            } else {
                let errData;
                try {
                    errData = await res.json();
                } catch {
                    errData = { message: `Server error ${res.status}` };
                }
                showToast(`Failed to save product: ${errData.message || 'Unknown error'}`, "error");
            }
        } catch (err) {
            showToast(`Error: ${err.message}`, "error");
        } finally {
            setSubmitLoading(false);
        }
    };

    if (authLoading) return <div className="AdminLoading">Verifying access...</div>;

    if (!isAuthorized) {
        return (
            <div className="AdminDenied">
                <h2>Access Denied</h2>
                <p>You do not have permission to view the Inventory Portal.</p>
                <Link to="/" className="AdminPrimaryBtn" style={{ textDecoration: 'none' }}>Return Home</Link>
            </div>
        );
    }

    return (
        <div className="ListerContainer">
            {/* Sidebar navigation */}
            <aside className="ListerSidebar">
                <h2>Lister Portal</h2>
                <nav className="AdminNav">
                    <button 
                        className={`AdminNavBtn ${activeTab === 'inventory' ? 'active' : ''}`}
                        onClick={() => setActiveTab('inventory')}
                    >
                        Current Inventory
                    </button>
                    <button 
                        className={`AdminNavBtn ${activeTab === 'add' ? 'active' : ''}`}
                        onClick={() => { resetForm(); setActiveTab('add'); }}
                    >
                        + Add New Item
                    </button>
                </nav>
            </aside>

            {/* Main view area */}
            <main className="ListerContent">
                {activeTab === "inventory" && (
                    <div>
                        <div className="SectionHeader">
                            <div className="AdminHeader" style={{marginBottom: 0}}>
                                <h1>Inventory Management</h1>
                                <p>View and manage kit catalog records.</p>
                            </div>
                            <button className="AdminPrimaryBtn" onClick={() => { resetForm(); setActiveTab("add"); }}>
                                + Add Product
                            </button>
                        </div>

                        {loading ? (
                            <div className="AdminLoading">Loading inventory...</div>
                        ) : inventory.length === 0 ? (
                            <div style={{padding: '40px', textAlign: 'center', color: '#6b7280'}}>No items found.</div>
                        ) : (
                            <div className="AdminTableWrapper">
                                <table className="AdminTable">
                                    <thead>
                                        <tr>
                                            <th>Image</th>
                                            <th>Name</th>
                                            <th>Season</th>
                                            <th>Price</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {inventory.map((item) => (
                                            <tr key={item.tShirtId}>
                                                <td>
                                                    <img 
                                                        src={item.shirtLinks && item.shirtLinks.length > 0 ? item.shirtLinks[0].shirtLinkUrl : "/placeholder.png"} 
                                                        alt={item.shirtName}
                                                        style={{width: '40px', height: '40px', objectFit: 'contain', borderRadius: '4px'}}
                                                    />
                                                </td>
                                                <td><strong>{item.shirtName}</strong></td>
                                                <td>{item.shirtSeason}</td>
                                                <td>R {item.shirtPrice.toFixed(2)}</td>
                                                <td>
                                                    <span className={`StatusBadge ${item.shirtStatus?.toLowerCase() === 'available' ? 'active' : 'inactive'}`}>
                                                        {item.shirtStatus}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button className="AdminActionBtn" onClick={() => openEditForm(item)}>
                                                        Edit
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {(activeTab === "add" || activeTab === "edit") && (
                    <div className="AdminModalForm" style={{maxWidth: '800px', margin: '0 auto'}}>
                        <div className="AdminHeader">
                            <h1>{activeTab === "edit" ? "Edit Product" : "Add New Kit"}</h1>
                            <p>{activeTab === "edit" ? "Update kit details, images, and inventory." : "Create a new jersey in the catalog."}</p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <h3 className="FormSectionTitle">Basic Information</h3>
                            
                            <div className="FormRow">
                                <div className="InputGroup">
                                    <label>Jersey Name *</label>
                                    <input 
                                        type="text" 
                                        name="shirtName" 
                                        value={formData.shirtName} 
                                        onChange={handleFormChange} 
                                        placeholder="e.g. Kaizer Chiefs Home" 
                                        required 
                                    />
                                </div>
                                <div className="InputGroup">
                                    <label>Season *</label>
                                    <input 
                                        type="text" 
                                        name="shirtSeason" 
                                        value={formData.shirtSeason} 
                                        onChange={handleFormChange} 
                                        placeholder="e.g. 2026/27" 
                                        required 
                                    />
                                </div>
                            </div>

                            <div className="FormRow">
                                <div className="InputGroup">
                                    <label>Price (ZAR) *</label>
                                    <input 
                                        type="number" 
                                        step="0.01" 
                                        name="shirtPrice" 
                                        value={formData.shirtPrice} 
                                        onChange={handleFormChange} 
                                        placeholder="e.g. 1299.99" 
                                        required 
                                    />
                                </div>
                                <div className="InputGroup">
                                    <label>Team ID *</label>
                                    <input 
                                        type="number" 
                                        name="teamId" 
                                        value={formData.teamId} 
                                        onChange={handleFormChange} 
                                        placeholder="e.g. 1" 
                                        required 
                                    />
                                </div>
                            </div>

                            <div className="FormRow">
                                <div className="InputGroup">
                                    <label>Gender *</label>
                                    <select name="shirtGender" value={formData.shirtGender} onChange={handleFormChange}>
                                        <option value="Unisex">Unisex</option>
                                        <option value="Men">Men</option>
                                        <option value="Women">Women</option>
                                        <option value="Kids">Kids</option>
                                    </select>
                                </div>
                                <div className="InputGroup">
                                    <label>Status *</label>
                                    <select name="shirtStatus" value={formData.shirtStatus} onChange={handleFormChange}>
                                        <option value="Available">Available</option>
                                        <option value="Out of Stock">Out of Stock</option>
                                        <option value="Pre-order">Pre-order</option>
                                    </select>
                                </div>
                            </div>

                            <div className="InputGroup">
                                <label>Affiliate / Brand Tag</label>
                                <input 
                                    type="text" 
                                    name="shirtAffiliate" 
                                    value={formData.shirtAffiliate} 
                                    onChange={handleFormChange} 
                                    placeholder="e.g. Nike / Puma / Kappa" 
                                />
                            </div>

                            <div className="InputGroup">
                                <label>Description</label>
                                <textarea 
                                    rows="4" 
                                    name="shirtDescription" 
                                    value={formData.shirtDescription} 
                                    onChange={handleFormChange} 
                                    placeholder="Add fabric details, sizing advice, or product description..."
                                />
                            </div>

                            <h3 className="FormSectionTitle">Competitions</h3>
                            <div style={{display: 'flex', flexWrap: 'wrap', gap: '15px', marginBottom: '20px'}}>
                                {competitions.map(comp => (
                                    <label key={comp.competitionId} style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'}}>
                                        <input 
                                            type="checkbox" 
                                            checked={selectedCompetitions.includes(comp.competitionId)}
                                            onChange={(e) => {
                                                if (e.target.checked) setSelectedCompetitions([...selectedCompetitions, comp.competitionId]);
                                                else setSelectedCompetitions(selectedCompetitions.filter(id => id !== comp.competitionId));
                                            }}
                                            style={{width: '16px', height: '16px', accentColor: '#111'}}
                                        />
                                        {comp.competitionName}
                                    </label>
                                ))}
                                {competitions.length === 0 && <span style={{color: '#6b7280', fontSize: '0.9rem'}}>No competitions available. Add them in the Admin portal.</span>}
                            </div>
                            
                            <h3 className="FormSectionTitle">Image Links</h3>
                            <ImageUploader 
                                endpoint="/api/Upload/jersey" 
                                multiple={true} 
                                onUploadSuccess={(url) => {
                                    if (imageUrls.length === 1 && imageUrls[0] === "") {
                                        setImageUrls([url]);
                                    } else {
                                        setImageUrls([...imageUrls, url]);
                                    }
                                }} 
                            />
                            
                            {imageUrls.map((url, i) => (
                                <div className="DynamicListRow" key={i}>
                                    {url && (
                                        <div style={{width: '60px', height: '60px', borderRadius: '4px', overflow: 'hidden', border: '1px solid #e5e7eb'}}>
                                            <img src={url} alt="Preview" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                                        </div>
                                    )}
                                    <input 
                                        type="text" 
                                        placeholder="Or paste image URL"
                                        value={url}
                                        onChange={(e) => {
                                            const newUrls = [...imageUrls];
                                            newUrls[i] = e.target.value;
                                            setImageUrls(newUrls);
                                        }}
                                        required 
                                    />
                                    {i > 0 && (
                                        <button type="button" className="AdminActionBtn danger" onClick={() => setImageUrls(imageUrls.filter((_, idx) => idx !== i))}>
                                            Remove
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button type="button" className="AdminActionBtn" style={{marginTop: '10px'}} onClick={() => setImageUrls([...imageUrls, ""])}>
                                + Add Another Image
                            </button>

                            {/* Stock Adjustment Controls for Existing Items */}
                            {activeTab === "edit" && (
                                <>
                                    <h3 className="FormSectionTitle">Adjust Stock Levels (Optional)</h3>
                                    <p style={{fontSize: '0.85rem', color: '#6b7280', marginBottom: '10px'}}>
                                        Use positive numbers to add stock, and negative numbers to reduce stock. Leave at 0 to make no changes.
                                    </p>
                                    {stockAdjustments.map((adj, i) => (
                                        <div className="DynamicListRow" key={`adj-${i}`}>
                                            <select 
                                                value={adj.shirtSize} 
                                                onChange={(e) => {
                                                    const newAdj = [...stockAdjustments];
                                                    newAdj[i].shirtSize = e.target.value;
                                                    setStockAdjustments(newAdj);
                                                }}
                                                style={{width: '120px'}}
                                            >
                                                <option value="S">S</option>
                                                <option value="M">M</option>
                                                <option value="L">L</option>
                                                <option value="XL">XL</option>
                                                <option value="XXL">XXL</option>
                                            </select>
                                            <input 
                                                type="number" 
                                                placeholder="e.g. 5 or -2"
                                                value={adj.amount} 
                                                onChange={(e) => {
                                                    const newAdj = [...stockAdjustments];
                                                    newAdj[i].amount = parseInt(e.target.value) || 0;
                                                    setStockAdjustments(newAdj);
                                                }} 
                                                required
                                            />
                                            {i > 0 && (
                                                <button type="button" className="AdminActionBtn danger" onClick={() => setStockAdjustments(stockAdjustments.filter((_, idx) => idx !== i))}>
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button type="button" className="AdminActionBtn" style={{marginTop: '10px'}} onClick={() => setStockAdjustments([...stockAdjustments, { shirtSize: "S", amount: 0 }])}>
                                        + Add Another Adjustment
                                    </button>
                                </>
                            )}

                            {/* Initial Stock Configuration for New Items */}
                            {activeTab === "add" && (
                                <>
                                    <h3 className="FormSectionTitle">Sizes & Stock</h3>
                                    {sizes.map((sizeObj, i) => (
                                        <div className="DynamicListRow" key={i}>
                                            <select 
                                                value={sizeObj.shirtSize} 
                                                onChange={(e) => handleSizeChange(i, 'shirtSize', e.target.value)}
                                                style={{width: '120px'}}
                                            >
                                                <option value="S">S</option>
                                                <option value="M">M</option>
                                                <option value="L">L</option>
                                                <option value="XL">XL</option>
                                                <option value="XXL">XXL</option>
                                            </select>
                                            <input 
                                                type="number" 
                                                placeholder="Amount in Stock" 
                                                value={sizeObj.amountAvailable} 
                                                onChange={(e) => handleSizeChange(i, 'amountAvailable', e.target.value)} 
                                                required 
                                            />
                                            {i > 0 && (
                                                <button type="button" className="AdminActionBtn danger" onClick={() => setSizes(sizes.filter((_, idx) => idx !== i))}>
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button type="button" className="AdminActionBtn" style={{marginTop: '10px'}} onClick={() => setSizes([...sizes, { shirtSize: "S", amountAvailable: 0 }])}>
                                        + Add Another Size
                                    </button>
                                </>
                            )}

                            <div style={{marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #e5e7eb', textAlign: 'right'}}>
                                <button type="button" className="AdminActionBtn" onClick={() => setActiveTab('inventory')} style={{marginRight: '10px'}}>
                                    CANCEL
                                </button>
                                <button type="submit" className="AdminPrimaryBtn" disabled={submitLoading}>
                                    {submitLoading ? "SAVING..." : activeTab === "edit" ? "SAVE CHANGES" : "ADD PRODUCT"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </main>
        </div>
    );
}

export default ItemListerPage;
