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

    // Initial check for Auth
    useEffect(() => {
        if (!authLoading && (!user || user.role !== "Admin")) {
            // Unauthenticated or not admin
            // We stay on the page but render the Denied view.
        }
    }, [user, authLoading]);

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
                if (res.ok) setBanners(await res.json());
                else throw new Error("Failed to load banners data");
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
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
                    <div className="AdminError">{error}</div>
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
                                                <th>Role</th>
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
                                                    <td>
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
                                    <button className="AdminPrimaryBtn">+ Add Banner</button>
                                </div>
                                <div className="AdminTableWrapper">
                                    <table className="AdminTable">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Title</th>
                                                <th>Status</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {banners.map(b => (
                                                <tr key={b.bannerId}>
                                                    <td>{b.bannerId}</td>
                                                    <td>{b.bannerTitle || 'Untitled Banner'}</td>
                                                    <td>{b.bannerStatus || 'Active'}</td>
                                                    <td>
                                                        <button className="AdminActionBtn">Edit</button>
                                                        <button className="AdminActionBtn danger">Delete</button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {banners.length === 0 && (
                                                <tr>
                                                    <td colSpan="4" style={{textAlign: 'center', padding: '30px'}}>No banners found.</td>
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
