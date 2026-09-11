import { useState, useEffect } from "react";
import { useAuth } from "./AuthContext.jsx";
import { useToast } from "./ToastContext.jsx";
import { Link } from "react-router-dom";
import "./AdminPage.css"; // Reuse table styles
import "./ItemListerPage.css";

function ItemListerPage() {
    const { user, loading: authLoading, logout } = useAuth();
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState("inventory");
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);

    // Form State
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

    const isAuthorized = user && (user.role === "Admin" || user.role === "Item Lister");

    useEffect(() => {
        if (isAuthorized && activeTab === "inventory") {
            fetchInventory();
        }
    }, [isAuthorized, activeTab]);

    const fetchInventory = async () => {
        setLoading(true);
        try {
            const res = await fetch("https://kitverse-production.up.railway.app/api/TShirt");
            if (res.ok) setInventory(await res.json());
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (index, value) => {
        const newImages = [...imageUrls];
        newImages[index] = value;
        setImageUrls(newImages);
    };

    const handleSizeChange = (index, field, value) => {
        const newSizes = [...sizes];
        newSizes[index][field] = field === "amountAvailable" ? parseInt(value) || 0 : value;
        setSizes(newSizes);
    };

    const resetForm = () => {
        setFormData({
            tShirtId: 0, shirtName: "", shirtSeason: "", shirtPrice: "", shirtAffiliate: "",
            shirtGender: "Unisex", shirtDescription: "", shirtStatus: "Available", teamId: ""
        });
        setImageUrls([""]);
        setSizes([{ shirtSize: "M", amountAvailable: 10 }]);
    };

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
        // We just map the imageUrls array back 
        if (item.shirtLinks && item.shirtLinks.length > 0) {
            setImageUrls(item.shirtLinks.map(link => link.shirtLinkUrl));
        } else {
            setImageUrls([""]);
        }
        
        // Note: The backend GET doesn't easily expose sizes in the main payload without calling inventory endpoint,
        // so we'll just populate a default size block if it's missing. (Update doesn't seem to natively handle sizes in TShirt object directly based on C# model, but we'll include it just in case).
        setSizes([{ shirtSize: "M", amountAvailable: 10 }]);
        setActiveTab("edit");
    };

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
            // The backend Update endpoint expects TShirt object which has ShirtLinks array
            shirtLinks: imageUrls.filter(url => url.trim() !== "").map(url => ({ shirtLinkUrl: url }))
        } : {
            // Create uses CreateTShirt DTO
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
                <Link to="/" className="AdminPrimaryBtn" style={{textDecoration: 'none'}}>Return Home</Link>
            </div>
        );
    }

    return (
        <div className="ListerContainer">
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
                        Add New Product
                    </button>
                    {activeTab === 'edit' && (
                        <button className="AdminNavBtn active">Edit Product</button>
                    )}
                </nav>
            </aside>

            <main className="ListerContent">
                {activeTab === "inventory" && (
                    <div>
                        <div className="SectionHeader">
                            <div className="AdminHeader" style={{marginBottom: 0}}>
                                <h1>Inventory Management</h1>
                                <p>View all products currently listed in the store.</p>
                            </div>
                            <button className="AdminPrimaryBtn" onClick={() => { resetForm(); setActiveTab("add"); }}>
                                + Add Product
                            </button>
                        </div>

                        {loading ? <div className="AdminLoading">Loading inventory...</div> : (
                            <div className="AdminTableWrapper">
                                <table className="AdminTable">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Image</th>
                                            <th>Name</th>
                                            <th>Team ID</th>
                                            <th>Season</th>
                                            <th>Price</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {inventory.map(item => (
                                            <tr key={item.tShirtId}>
                                                <td>{item.tShirtId}</td>
                                                <td>
                                                    <img 
                                                        src={item.shirtLinks?.[0]?.shirtLinkUrl || "/placeholder.png"} 
                                                        alt="thumbnail" 
                                                        style={{width: '40px', height: '50px', objectFit: 'contain'}} 
                                                    />
                                                </td>
                                                <td style={{fontWeight: 'bold'}}>{item.shirtName}</td>
                                                <td>{item.teamId}</td>
                                                <td>{item.shirtSeason}</td>
                                                <td>R {item.shirtPrice.toFixed(2)}</td>
                                                <td>
                                                    <span className={`RoleBadge ${item.shirtStatus === 'Available' ? 'Admin' : 'Customer'}`}>
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
                    <div>
                        <div className="AdminHeader">
                            <h1>{activeTab === "edit" ? "Edit Product Details" : "List New Product"}</h1>
                            <p>{activeTab === "edit" ? "Update the information for this product." : "Fill out the details below to add a new jersey to the storefront."}</p>
                        </div>
                        
                        <form className="ListerForm" onSubmit={handleSubmit}>
                            <h3 className="FormSectionTitle">Basic Details</h3>
                            <div className="FormGrid">
                                <div className="FormGroup">
                                    <label>Product Name (e.g. Pirates_Home)</label>
                                    <input type="text" name="shirtName" value={formData.shirtName} onChange={handleFormChange} required />
                                </div>
                                <div className="FormGroup">
                                    <label>Season (e.g. 2024/25)</label>
                                    <input type="text" name="shirtSeason" value={formData.shirtSeason} onChange={handleFormChange} required />
                                </div>
                                <div className="FormGroup">
                                    <label>Price (R)</label>
                                    <input type="number" step="0.01" name="shirtPrice" value={formData.shirtPrice} onChange={handleFormChange} required />
                                </div>
                                <div className="FormGroup">
                                    <label>Team</label>
                                    <select name="teamId" value={formData.teamId} onChange={handleFormChange} required>
                                        <option value="" disabled>Select a Team</option>
                                        {Array.from(new Map(inventory.filter(t => t.team).map(t => [t.team.teamId, t.team])).values()).map(team => (
                                            <option key={team.teamId} value={team.teamId}>{team.teamName}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="FormGroup">
                                    <label>Gender</label>
                                    <select name="shirtGender" value={formData.shirtGender} onChange={handleFormChange}>
                                        <option value="Mens">Mens</option>
                                        <option value="Womens">Womens</option>
                                        <option value="Kids">Kids</option>
                                        <option value="Unisex">Unisex</option>
                                    </select>
                                </div>
                                <div className="FormGroup">
                                    <label>Status</label>
                                    <select name="shirtStatus" value={formData.shirtStatus} onChange={handleFormChange}>
                                        <option value="Available">Available</option>
                                        <option value="Out of Stock">Out of Stock</option>
                                        <option value="Discontinued">Discontinued</option>
                                    </select>
                                </div>
                                <div className="FormGroup full-width">
                                    <label>Description</label>
                                    <textarea name="shirtDescription" value={formData.shirtDescription} onChange={handleFormChange} required></textarea>
                                </div>
                            </div>

                            <h3 className="FormSectionTitle">Images</h3>
                            <p style={{fontSize: '0.85rem', color: '#6b7280', marginBottom: '15px'}}>The first image will be set as the Main image.</p>
                            {imageUrls.map((url, i) => (
                                <div className="DynamicListRow" key={i}>
                                    <input 
                                        type="text" 
                                        placeholder="https://example.com/image.png" 
                                        value={url} 
                                        onChange={(e) => handleImageChange(i, e.target.value)} 
                                        required={i === 0}
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
                                                placeholder="Amount Available" 
                                                value={sizeObj.amountAvailable} 
                                                onChange={(e) => handleSizeChange(i, 'amountAvailable', e.target.value)} 
                                                min="0"
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
                                    {submitLoading ? "SAVING..." : (activeTab === "edit" ? "SAVE CHANGES" : "PUBLISH PRODUCT")}
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
