import { useState, useEffect } from "react";
import { useAuth } from "./AuthContext.jsx";
import { Link, useNavigate } from "react-router-dom";
import "./AdminPage.css";

function AdminPage() {
    const { user, loading: authLoading, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("dashboard");
    
    const [dashboardData, setDashboardData] = useState(null);
    const [users, setUsers] = useState([]);
    const [banners, setBanners] = useState([]);
    const [tshirts, setTshirts] = useState([]); // Needed for banner dropdowns
    const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
    const [newBanner, setNewBanner] = useState({ bannerName: "", bannerDescription: "", bannerUrl: "", team1ID: "", team2ID: "" });
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (user && user.role === "Admin") {
            fetchData();
        }
    }, [activeTab, user]);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            if (activeTab === "dashboard") {
                const res = await fetch("https://kitverse-production.up.railway.app/api/admin/dashboard");
                if (res.ok) setDashboardData(await res.json());
                else throw new Error("Failed to load dashboard data");
            } else if (activeTab === "users") {
                const res = await fetch("https://kitverse-production.up.railway.app/api/admin/users");
                if (res.ok) setUsers(await res.json());
                else throw new Error("Failed to load users data");
            } else if (activeTab === "banners") {
                const res = await fetch("https://kitverse-production.up.railway.app/api/admin/banners");
                const tshirtRes = await fetch("https://kitverse-production.up.railway.app/api/TShirt");
                
                if (tshirtRes.ok) {
                    setTshirts(await tshirtRes.json());
                }

                if (res.ok) {
                    setBanners(await res.json());
                } else if (res.status === 500) {
                    throw new Error("Backend Error 500: The Banners table is missing or misconfigured in the database.");
                } else {
                    throw new Error("Failed to load banners data");
                }
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;
        try {
            const res = await fetch(`https://kitverse-production.up.railway.app/api/admin/users/${userId}/role`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newRole)
            });
            if (res.ok) {
                alert("Role changed successfully!");
                fetchData();
            } else {
                alert("Failed to change user role.");
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            const res = await fetch(`https://kitverse-production.up.railway.app/api/admin/users/${userId}`, {
                method: "DELETE"
            });
            if (res.ok) {
                fetchData(); 
            } else {
                alert("Failed to delete user.");
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddBannerSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                bannerName: newBanner.bannerName,
                bannerDescription: newBanner.bannerDescription || null,
                bannerUrl: newBanner.bannerUrl,
                team1ID: newBanner.team1ID ? parseInt(newBanner.team1ID) : 0,
                team2ID: newBanner.team2ID ? parseInt(newBanner.team2ID) : 0,
            };
            const res = await fetch("https://kitverse-production.up.railway.app/api/TShirt/Banner", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json", 
                    "Authorization": `Bearer ${user?.token}` 
                },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                setIsBannerModalOpen(false);
                setNewBanner({ bannerName: "", bannerDescription: "", bannerUrl: "", team1ID: "", team2ID: "" });
                fetchData();
            } else if (res.status === 401 || res.status === 403) {
                alert("Your session has expired. You are being logged out.");
                logout();
            } else {
                let errorData;
                try {
                    errorData = await res.json();
                } catch {
                    errorData = { message: `Server error ${res.status}` };
                }
                alert(`Failed to add banner: ${errorData.message || "Unknown error"}`);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteBanner = async (bannerId) => {
        if (!window.confirm("Are you sure you want to delete this banner?")) return;
        try {
            const res = await fetch(`https://kitverse-production.up.railway.app/api/admin/banners/${bannerId}`, {
                method: "DELETE"
            });
            if (res.ok) fetchData();
            else alert("Failed to delete banner.");
        } catch (err) {
            console.error(err);
        }
    };

    if (authLoading) return <div className="AdminLoading">Verifying access...</div>;

    if (!user || user.role !== "Admin") {
        return (
            <div className="AdminDenied">
                <h2>Access Denied</h2>
                <p>You do not have permission to view the Admin Portal.</p>
                <Link to="/" className="AdminPrimaryBtn" style={{textDecoration: 'none'}}>Return Home</Link>
            </div>
        );
    }

    return (
        <div className="AdminContainer">
            <aside className="AdminSidebar">
                <h2>Admin Portal</h2>
                <nav className="AdminNav">
                    <button 
                        className={`AdminNavBtn ${activeTab === 'dashboard' ? 'active' : ''}`}
                        onClick={() => setActiveTab('dashboard')}
                    >
                        Dashboard
                    </button>
                    <button 
                        className={`AdminNavBtn ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveTab('users')}
                    >
                        User Management
                    </button>
                    <button 
                        className={`AdminNavBtn ${activeTab === 'banners' ? 'active' : ''}`}
                        onClick={() => setActiveTab('banners')}
                    >
                        Banners
                    </button>
                </nav>
            </aside>

            <main className="AdminContent">
                {loading ? (
                    <div className="AdminLoading">Loading...</div>
                ) : error ? (
                    <div className="AdminError" style={{background: '#fee2e2', padding: '20px', borderRadius: '8px', border: '1px solid #ef4444'}}>
                        <h3 style={{marginTop: 0}}>Error</h3>
                        {error}
                    </div>
                ) : (
                    <>
                        {/* DASHBOARD TAB */}
                        {activeTab === 'dashboard' && dashboardData && (
                            <div>
                                <div className="AdminHeader">
                                    <h1>Overview</h1>
                                    <p>Welcome back, {user.userName}. Here is what's happening today.</p>
                                </div>
                                <div className="DashboardGrid">
                                    <div className="DashboardCard">
                                        <span className="DashboardCardTitle">Total Users</span>
                                        <span className="DashboardCardValue">{dashboardData.totalUsers}</span>
                                    </div>
                                    <div className="DashboardCard">
                                        <span className="DashboardCardTitle">Customers</span>
                                        <span className="DashboardCardValue">{dashboardData.totalCustomers}</span>
                                    </div>
                                    <div className="DashboardCard">
                                        <span className="DashboardCardTitle">Item Listers</span>
                                        <span className="DashboardCardValue">{dashboardData.totalItemListers}</span>
                                    </div>
                                    <div className="DashboardCard">
                                        <span className="DashboardCardTitle">Admins</span>
                                        <span className="DashboardCardValue">{dashboardData.totalAdmins}</span>
                                    </div>
                                    <div className="DashboardCard">
                                        <span className="DashboardCardTitle">Active Accounts</span>
                                        <span className="DashboardCardValue">{dashboardData.activeUsers}</span>
                                    </div>
                                    <div className="DashboardCard">
                                        <span className="DashboardCardTitle">Inactive Accounts</span>
                                        <span className="DashboardCardValue">{dashboardData.inactiveUsers}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* USERS TAB */}
                        {activeTab === 'users' && (
                            <div>
                                <div className="SectionHeader">
                                    <div className="AdminHeader" style={{marginBottom: 0}}>
                                        <h1>User Management</h1>
                                        <p>Manage roles and permissions across the platform.</p>
                                    </div>
                                </div>
                                <div className="AdminTableWrapper">
                                    <table className="AdminTable">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Name</th>
                                                <th>Email</th>
                                                <th>Role Controls</th>
                                                <th>Status</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map(u => (
                                                <tr key={u.userId}>
                                                    <td>{u.userId}</td>
                                                    <td>{u.userName} {u.userSurname}</td>
                                                    <td>{u.userEmail}</td>
                                                    <td style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                                                        <select 
                                                            className="AdminActionBtn"
                                                            value={u.role || 'Customer'}
                                                            onChange={(e) => handleRoleChange(u.userId, e.target.value)}
                                                        >
                                                            <option value="Customer">Customer</option>
                                                            <option value="Item Lister">Item Lister</option>
                                                            <option value="Admin">Admin</option>
                                                        </select>
                                                        <span className={`RoleBadge ${u.role === 'Admin' ? 'Admin' : u.role === 'Item Lister' ? 'ItemLister' : 'Customer'}`}>
                                                            {u.role || 'Customer'}
                                                        </span>
                                                    </td>
                                                    <td>{u.userStatus || 'Active'}</td>
                                                    <td>
                                                        <button className="AdminActionBtn danger" onClick={() => handleDeleteUser(u.userId)}>
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {users.length === 0 && (
                                                <tr>
                                                    <td colSpan="6" style={{textAlign: 'center', padding: '30px'}}>No users found.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* BANNERS TAB */}
                        {activeTab === 'banners' && (
                            <div>
                                <div className="SectionHeader">
                                    <div className="AdminHeader" style={{marginBottom: 0}}>
                                        <h1>Banners</h1>
                                        <p>Manage promotional banners displayed on the homepage.</p>
                                    </div>
                                    <button className="AdminPrimaryBtn" onClick={() => setIsBannerModalOpen(true)}>+ Add Banner</button>
                                </div>

                                {isBannerModalOpen && (
                                    <div style={{background: '#ffffff', padding: '30px', borderRadius: '8px', border: '1px solid #e5e7eb', marginBottom: '25px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)'}}>
                                        <h3 style={{marginTop: 0, marginBottom: '20px', fontSize: '1.25rem', fontWeight: 800}}>Create New Banner</h3>
                                        <form onSubmit={handleAddBannerSubmit} style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
                                            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
                                                <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                                                    <label style={{fontSize: '0.85rem', fontWeight: 700}}>Banner Name / Title</label>
                                                    <input type="text" value={newBanner.bannerName} onChange={e => setNewBanner({...newBanner, bannerName: e.target.value})} required style={{padding: '12px', border: '1px solid #d1d5db', borderRadius: '4px'}} placeholder="e.g., Summer Derby" />
                                                </div>
                                                <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                                                    <label style={{fontSize: '0.85rem', fontWeight: 700}}>Image URL (Required)</label>
                                                    <input type="text" value={newBanner.bannerUrl} onChange={e => setNewBanner({...newBanner, bannerUrl: e.target.value})} required style={{padding: '12px', border: '1px solid #d1d5db', borderRadius: '4px'}} placeholder="https://example.com/banner.png" />
                                                </div>
                                            </div>
                                            
                                            <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                                                <label style={{fontSize: '0.85rem', fontWeight: 700}}>Short Description (Optional)</label>
                                                <input type="text" value={newBanner.bannerDescription} onChange={e => setNewBanner({...newBanner, bannerDescription: e.target.value})} style={{padding: '12px', border: '1px solid #d1d5db', borderRadius: '4px'}} placeholder="Get ready for the biggest rivalry..." />
                                            </div>

                                            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', background: '#f9fafb', padding: '15px', borderRadius: '6px'}}>
                                                <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                                                    <label style={{fontSize: '0.85rem', fontWeight: 700}}>T-Shirt 1 ID</label>
                                                    <select value={newBanner.team1ID} onChange={e => setNewBanner({...newBanner, team1ID: e.target.value})} style={{padding: '12px', border: '1px solid #d1d5db', borderRadius: '4px'}}>
                                                        <option value="">Select a T-Shirt</option>
                                                        {tshirts.map(t => (
                                                            <option key={t.tShirtId} value={t.tShirtId}>{t.shirtName} (ID: {t.tShirtId})</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                                                    <label style={{fontSize: '0.85rem', fontWeight: 700}}>T-Shirt 2 ID (Rivalry only)</label>
                                                    <select value={newBanner.team2ID} onChange={e => setNewBanner({...newBanner, team2ID: e.target.value})} style={{padding: '12px', border: '1px solid #d1d5db', borderRadius: '4px'}}>
                                                        <option value="">Leave empty if single product</option>
                                                        {tshirts.map(t => (
                                                            <option key={t.tShirtId} value={t.tShirtId}>{t.shirtName} (ID: {t.tShirtId})</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                            
                                            <div style={{display: 'flex', gap: '15px', justifyContent: 'flex-end', marginTop: '10px'}}>
                                                <button type="button" className="AdminActionBtn" onClick={() => setIsBannerModalOpen(false)}>Cancel</button>
                                                <button type="submit" className="AdminPrimaryBtn">Publish Banner</button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                <div className="AdminTableWrapper">
                                    <table className="AdminTable">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Preview</th>
                                                <th>Name & Details</th>
                                                <th>Linked IDs</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {banners.map(b => (
                                                <tr key={b.bannerId}>
                                                    <td>{b.bannerId}</td>
                                                    <td>
                                                        <img src={b.bannerUrl || b.imageUrl} alt="banner" style={{width: '120px', height: '40px', objectFit: 'cover', borderRadius: '4px'}} />
                                                    </td>
                                                    <td>
                                                        <strong>{b.bannerName || 'Untitled Banner'}</strong>
                                                        <div style={{fontSize: '0.85rem', color: '#6b7280', marginTop: '4px'}}>{b.bannerDescription}</div>
                                                    </td>
                                                    <td>
                                                        {(b.team1ID || b.team2ID) ? (
                                                            <span className="RoleBadge Admin" style={{background: '#fef08a', color: '#854d0e'}}>
                                                                IDs: {b.team1ID || '0'} / {b.team2ID || '0'}
                                                            </span>
                                                        ) : (
                                                            <span style={{color: '#a3a3a3'}}>None</span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <button className="AdminActionBtn danger" onClick={() => handleDeleteBanner(b.bannerId)}>Delete</button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {banners.length === 0 && (
                                                <tr>
                                                    <td colSpan="5" style={{textAlign: 'center', padding: '30px'}}>No banners found. Click "+ Add Banner" above to create one.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}

export default AdminPage;
