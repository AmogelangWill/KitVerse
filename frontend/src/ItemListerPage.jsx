import { useState, useEffect } from "react";
import { useAuth } from "./AuthContext.jsx";
import { Link } from "react-router-dom";
import "./AdminPage.css"; // Reuse table styles
import "./ItemListerPage.css";

function ItemListerPage() {
    const { user, loading: authLoading } = useAuth();
    const [activeTab, setActiveTab] = useState("inventory");
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);

        const payload = {
            ...formData,
            shirtPrice: parseFloat(formData.shirtPrice),
            teamId: parseInt(formData.teamId),
            imageUrls: imageUrls.filter(url => url.trim() !== ""),
            sizes: sizes.filter(s => s.shirtSize.trim() !== "")
        };

        try {
            const res = await fetch("https://kitverse-production.up.railway.app/api/TShirt", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${user.token}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert("Product successfully added to inventory!");
                setActiveTab("inventory");
                // Reset form
                setFormData({
                    shirtName: "", shirtSeason: "", shirtPrice: "", shirtAffiliate: "",
                    shirtGender: "Unisex", shirtDescription: "", shirtStatus: "Available", teamId: ""
                });
                setImageUrls([""]);
                setSizes([{ shirtSize: "M", amountAvailable: 10 }]);
            } else {
                const errData = await res.json();
                alert(`Failed to add product: ${errData.message || 'Unknown error'}`);
            }
        } catch (err) {
            alert(`Error: ${err.message}`);
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
                        onClick={() => setActiveTab('add')}
                    >
                        Add New Product
                    </button>
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
                            <button className="AdminPrimaryBtn" onClick={() => setActiveTab("add")}>
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
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "add" && (
                    <div>
                        <div className="AdminHeader">
                            <h1>List New Product</h1>
                            <p>Fill out the details below to add a new jersey to the storefront.</p>
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
                                    <label>Team ID</label>
                                    <input type="number" name="teamId" value={formData.teamId} onChange={handleFormChange} required />
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
                                    <label>Affiliate / Brand (Optional)</label>
                                    <input type="text" name="shirtAffiliate" value={formData.shirtAffiliate} onChange={handleFormChange} />
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

                            <div style={{marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #e5e7eb', textAlign: 'right'}}>
                                <button type="submit" className="AdminPrimaryBtn" disabled={submitLoading}>
                                    {submitLoading ? "SAVING..." : "PUBLISH PRODUCT"}
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
