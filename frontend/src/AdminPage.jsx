import { useState, useEffect } from "react";
import { useAuth } from "./AuthContext.jsx";
import { Link, useNavigate } from "react-router-dom";
import "./AdminPage.css";

function AdminPage() {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("dashboard");
    
    const [dashboardData, setDashboardData] = useState(null);
    const [users, setUsers] = useState([]);
    const [banners, setBanners] = useState([]);
    
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
                if (res.ok) {
                    setBanners(await res.json());
                } else if (res.status === 500) {
                    throw new Error("Backend Error 500: The Banners table is likely missing or misconfigured in the database (EF Core Mapping). Tell the backend team!");
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
                fetchData(); // Refresh list
            } else {
                alert("Failed to delete user.");
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddBanner = async () => {
        const url = window.prompt("Enter the Image URL for the new banner:");
        if (!url) return;
        try {
            const res = await fetch("https://kitverse-production.up.railway.app/api/admin/banners", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ imageUrl: url, dateAdded: new Date().toISOString() })
            });
            if (res.ok) fetchData();
            else alert("Failed to add banner.");
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
                                    <button className="AdminPrimaryBtn" onClick={handleAddBanner}>+ Add Banner</button>
                                </div>
                                <div className="AdminTableWrapper">
                                    <table className="AdminTable">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Image Preview</th>
                                                <th>Image URL</th>
                                                <th>Date Added</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {banners.map(b => (
                                                <tr key={b.bannerId}>
                                                    <td>{b.bannerId}</td>
                                                    <td>
                                                        <img src={b.imageUrl} alt="banner" style={{width: '150px', height: '40px', objectFit: 'cover', borderRadius: '4px'}} />
                                                    </td>
                                                    <td style={{maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                                                        <a href={b.imageUrl} target="_blank" rel="noreferrer" style={{color: '#1d4ed8'}}>{b.imageUrl}</a>
                                                    </td>
                                                    <td>{new Date(b.dateAdded).toLocaleDateString()}</td>
                                                    <td>
                                                        <button className="AdminActionBtn danger" onClick={() => handleDeleteBanner(b.bannerId)}>Delete</button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {banners.length === 0 && (
                                                <tr>
                                                    <td colSpan="5" style={{textAlign: 'center', padding: '30px'}}>No banners found. Click "+ Add Banner" to create one.</td>
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
