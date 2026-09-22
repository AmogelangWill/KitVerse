import { useState, useEffect } from "react";
import { useAuth } from "./AuthContext.jsx";
import { useToast } from "./ToastContext.jsx";
import { useConfirm } from "./ConfirmContext.jsx";
import ImageUploader from "./ImageUploader.jsx";
import { Link, useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import "./AdminPage.css";

// Admin dashboard for managing user permissions, competitions, promotional banners, and viewing platform metrics
function AdminPage() {
    const { user, loading: authLoading, logout } = useAuth();
    const { showToast } = useToast();
    const { confirm } = useConfirm();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("dashboard");
    
    const [dashboardData, setDashboardData] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [chartMonths, setChartMonths] = useState(12);
    const [users, setUsers] = useState([]);
    const [banners, setBanners] = useState([]);
    const [competitions, setCompetitions] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [newCompetitionName, setNewCompetitionName] = useState("");
    const [tshirts, setTshirts] = useState([]);
    const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
    const [newBanner, setNewBanner] = useState({ bannerName: "", bannerDescription: "", bannerUrl: "", team1ID: "", team2ID: "" });
    
    const [newsletterSubject, setNewsletterSubject] = useState("");
    const [newsletterBody, setNewsletterBody] = useState("");
    const [isSendingNewsletter, setIsSendingNewsletter] = useState(false);
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch tab-specific data when tab changes or admin session initializes
    useEffect(() => {
        if (user && user.role === "Admin") {
            fetchData();
        }
    }, [activeTab, user]);

    useEffect(() => {
        const fetchChart = async () => {
            if (activeTab === "dashboard" && user && user.role === "Admin") {
                try {
                    const res = await fetch(`https://kitverse-production.up.railway.app/api/admin/sales-over-time?months=${chartMonths}`, {
                        headers: { "Authorization": `Bearer ${user.token}` }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        const formatted = data.map(d => ({
                                name: `${d.month} ${String(d.year).slice(-2)}`,
                                sales: d.sales,
                                orders: d.orders
                            }));
                        setChartData(formatted);
                    }
                } catch (e) {
                    console.error("Failed to fetch chart data", e);
                }
            }
        };
        fetchChart();
    }, [activeTab, user, chartMonths]);

    // Loads metrics, users, banners, competitions, or invoices depending on active tab
    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            if (activeTab === "competitions") {
                const cRes = await fetch("https://kitverse-production.up.railway.app/api/TShirt/competitions");
                if (cRes.ok) setCompetitions(await cRes.json());
            } else if (activeTab === "dashboard") {
                const res = await fetch("https://kitverse-production.up.railway.app/api/admin/dashboard", {
                    headers: {
                        "Authorization": `Bearer ${user?.token}`
                    }
                });
                if (res.ok) {
                    setDashboardData(await res.json());
                } else if (res.status === 401 || res.status === 403) {
                    showToast("Your admin session has expired. Please sign in again.", "error");
                    logout();
                } else {
                    throw new Error("Failed to load dashboard data");
                }
            } else if (activeTab === "users") {
                const res = await fetch("https://kitverse-production.up.railway.app/api/admin/users", {
                    headers: {
                        "Authorization": `Bearer ${user?.token}`
                    }
                });
                if (res.ok) {
                    setUsers(await res.json());
                } else if (res.status === 401 || res.status === 403) {
                    showToast("Your admin session has expired. Please sign in again.", "error");
                    logout();
                } else {
                    throw new Error("Failed to load users data");
                }
            } else if (activeTab === "invoices") {
                const res = await fetch("https://kitverse-production.up.railway.app/api/admin/invoices", {
                    headers: {
                        "Authorization": `Bearer ${user?.token}`
                    }
                });
                if (res.ok) {
                    setInvoices(await res.json());
                } else if (res.status === 401 || res.status === 403) {
                    showToast("Your admin session has expired. Please sign in again.", "error");
                    logout();
                } else {
                    throw new Error("Failed to load invoices data");
                }
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

    // Broadcasts a newsletter email to all active subscribers
    const handleSendNewsletter = async (e) => {
        e.preventDefault();
        const isConfirmed = await confirm({
            title: "Send Newsletter",
            message: "Are you sure you want to blast this email out to ALL active subscribers? This action cannot be undone.",
            confirmText: "Yes, Send Blast"
        });
        if (!isConfirmed) return;
        
        setIsSendingNewsletter(true);
        try {
            const res = await fetch("https://kitverse-production.up.railway.app/api/admin/emails/send-newsletter", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${user?.token}`
                },
                body: JSON.stringify({ 
                    subject: newsletterSubject, 
                    htmlBody: newsletterBody 
                })
            });
            
            const data = await res.json().catch(() => ({}));
            
            if (res.ok) {
                showToast(`Newsletter sent successfully to ${data.emailsSent || 'all'} subscribers!`, "success");
                setNewsletterSubject("");
                setNewsletterBody("");
            } else if (res.status === 401 || res.status === 403) {
                showToast("Your admin session has expired.", "error");
                logout();
            } else {
                showToast(data.msg || "Failed to send newsletter. Check SMTP settings.", "error");
            }
        } catch (err) {
            console.error("Newsletter error:", err);
            showToast("Network error while sending newsletter.", "error");
        } finally {
            setIsSendingNewsletter(false);
        }
    };

    // Sends a PDF invoice to the customer
    const handleSendInvoice = async (invoiceId) => {
        try {
            const res = await fetch(`https://kitverse-production.up.railway.app/api/admin/send-invoice/${invoiceId}`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${user?.token}`
                }
            });
            const data = await res.json().catch(() => ({}));
            
            if (res.ok) {
                showToast(data.message || "Invoice sent successfully!", "success");
            } else if (res.status === 401 || res.status === 403) {
                showToast("Your admin session has expired. Please sign in again.", "error");
                logout();
            } else {
                showToast(data.message || "Failed to send invoice.", "error");
            }
        } catch (err) {
            console.error("Send invoice error:", err);
            showToast("Network error while sending invoice.", "error");
        }
    };

    // Updates user role permission level after user confirmation
    const handleRoleChange = async (userId, newRole) => {
        const isConfirmed = await confirm({
            title: "Change User Role",
            message: `Are you sure you want to change this user's role to ${newRole}? They will immediately gain or lose access based on this new role.`,
            confirmText: "Change Role"
        });
        if (!isConfirmed) return;
        try {
            const res = await fetch(`https://kitverse-production.up.railway.app/api/admin/users/${userId}/role`, {
                method: "PUT",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${user?.token}`
                },
                body: JSON.stringify(newRole)
            });
            if (res.ok) {
                showToast("Role changed successfully!", "success");
                fetchData();
            } else if (res.status === 401 || res.status === 403) {
                showToast("Your admin session has expired. Please sign in again.", "error");
                logout();
            } else {
                showToast("Failed to change user role.", "error");
            }
        } catch (err) {
            console.error("Role update error:", err);
        }
    };

    // Permanently removes a user account after explicit confirmation
    const handleDeleteUser = async (userId) => {
        const isConfirmed = await confirm({
            title: "Delete User",
            message: "Are you sure you want to permanently delete this user account? This action cannot be undone.",
            confirmText: "Delete User",
            danger: true
        });
        if (!isConfirmed) return;
        try {
            const res = await fetch(`https://kitverse-production.up.railway.app/api/admin/users/${userId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${user?.token}`
                }
            });
            if (res.ok) {
                fetchData(); 
            } else if (res.status === 401 || res.status === 403) {
                showToast("Your admin session has expired. Please sign in again.", "error");
                logout();
            } else {
                showToast("Failed to delete user.", "error");
            }
        } catch (err) {
            console.error("Delete user error:", err);
        }
    };

    // Adds a new competition tag to the database
    const handleCreateCompetition = async (e) => {
        e.preventDefault();
        try {
            const token = user?.token;
            const res = await fetch("https://kitverse-production.up.railway.app/api/TShirt/competitions", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ competitionName: newCompetitionName })
            });

            if (res.ok) {
                showToast("Competition created successfully!", "success");
                setNewCompetitionName("");
                fetchData();
            } else {
                showToast("Failed to create competition.", "error");
            }
        } catch (error) {
            showToast("Network error.", "error");
        }
    };

    // Saves a new promotional banner linked to specific featured kits
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
                showToast("Your session has expired. You are being logged out.", "error");
                logout();
            } else {
                let errorData;
                try {
                    errorData = await res.json();
                } catch {
                    errorData = { message: `Server error ${res.status}` };
                }
                showToast(`Failed to add banner: ${errorData.message || "Unknown error"}`, "error");
            }
        } catch (err) {
            console.error("Add banner error:", err);
        }
    };

    // Deletes a banner and updates the active banner list
    const handleDeleteBanner = async (bannerId) => {
        const isConfirmed = await confirm({
            title: "Delete Banner",
            message: "Are you sure you want to remove this banner from the storefront? It will no longer be visible to customers.",
            confirmText: "Delete Banner",
            danger: true
        });
        if (!isConfirmed) return;
        try {
            const res = await fetch(`https://kitverse-production.up.railway.app/api/admin/banners/${bannerId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${user?.token}`
                }
            });
            if (res.ok) {
                showToast("Banner deleted successfully!", "success");
                fetchData();
            } else if (res.status === 401 || res.status === 403) {
                showToast("Your admin session has expired. Please sign in again.", "error");
                logout();
            } else {
                showToast("Failed to delete banner.", "error");
            }
        } catch (err) {
            console.error("Delete banner error:", err);
        }
    };

    if (authLoading) return <div className="AdminLoading">Verifying access...</div>;

    if (!user || user.role !== "Admin") {
        return (
            <div className="AdminDenied">
                <h2>Access Denied</h2>
                <p>You do not have permission to view the Admin Portal.</p>
                <Link to="/" className="AdminPrimaryBtn" style={{ textDecoration: 'none' }}>Return Home</Link>
            </div>
        );
    }

    return (
        <div className="AdminContainer">
            {/* Sidebar tab navigation */}
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
                    <button 
                        className={`AdminNavBtn ${activeTab === 'competitions' ? 'active' : ''}`}
                        onClick={() => setActiveTab('competitions')}
                    >
                        Competitions
                    </button>
                    <button 
                        className={`AdminNavBtn ${activeTab === 'invoices' ? 'active' : ''}`}
                        onClick={() => setActiveTab('invoices')}
                    >
                        Invoices
                    </button>
                    <button 
                        className={`AdminNavBtn ${activeTab === 'newsletter' ? 'active' : ''}`}
                        onClick={() => setActiveTab('newsletter')}
                    >
                        Newsletter
                    </button>
                </nav>
            </aside>

            {/* Main content display based on active tab */}
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
                        {/* Analytics Overview Tab */}
                        {activeTab === 'dashboard' && dashboardData && (
                            <div>
                                <div className="AdminHeader">
                                    <h1>Overview</h1>
                                    <p>Welcome back, {user.userName}. Here is what is happening today.</p>
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
                                        <span className="DashboardCardTitle">Avg Monthly Users</span>
                                        <span className="DashboardCardValue">{dashboardData.avgmonthlyUsers ? dashboardData.avgmonthlyUsers.toFixed(1) : '0'}</span>
                                    </div>
                                    <div className="DashboardCard">
                                        <span className="DashboardCardTitle">Avg Monthly Sales</span>
                                        <span className="DashboardCardValue">R {dashboardData.avgsales ? dashboardData.avgsales.toFixed(2) : '0.00'}</span>
                                    </div>
                                    <div className="DashboardCard" style={{border: '2px solid #040404'}}>
                                        <span className="DashboardCardTitle">Avg Users/Day</span>
                                        <span className="DashboardCardValue">{dashboardData.avgdailyUsers ? dashboardData.avgdailyUsers.toFixed(1) : '0'}</span>
                                    </div>
                                    <div className="DashboardCard" style={{border: '2px solid #040404'}}>
                                        <span className="DashboardCardTitle">Products Sold</span>
                                        <span className="DashboardCardValue">{dashboardData.totalProductsSold !== undefined ? dashboardData.totalProductsSold : 'N/A'}</span>
                                    </div>
                                    <div className="DashboardCard" style={{border: '2px solid #040404'}}>
                                        <span className="DashboardCardTitle">Stock On Hand</span>
                                        <span className="DashboardCardValue">{dashboardData.totalStockOnHand !== undefined ? dashboardData.totalStockOnHand : 'N/A'}</span>
                                    </div>
                                </div>
                                
                                <div style={{marginTop: '40px', background: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #e5e7eb'}}>
                                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}>
                                        <h2 style={{margin: 0, fontSize: '18px'}}>Sales Over Time</h2>
                                        <select 
                                            value={chartMonths} 
                                            onChange={(e) => setChartMonths(parseInt(e.target.value))}
                                            style={{padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', cursor: 'pointer'}}
                                        >
                                            <option value={3}>Last 3 Months</option>
                                            <option value={6}>Last 6 Months</option>
                                            <option value={12}>Last 12 Months</option>
                                            <option value={24}>Last 24 Months</option>
                                        </select>
                                    </div>
                                    <div style={{height: '300px', width: '100%'}}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dx={-10} tickFormatter={(val) => `R ${val}`} />
                                                <Tooltip 
                                                    cursor={{fill: '#f3f4f6'}}
                                                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                                                    formatter={(value) => [`R ${value.toFixed(2)}`, 'Revenue']}
                                                />
                                                <Bar dataKey="sales" fill="#040404" radius={[4, 4, 0, 0]} barSize={40} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Users Management Tab */}
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
                                                            value={u.role} 
                                                            onChange={(e) => handleRoleChange(u.userId, e.target.value)}
                                                            className="RoleSelect"
                                                        >
                                                            <option value="Customer">Customer</option>
                                                            <option value="Item Lister">Item Lister</option>
                                                            <option value="Admin">Admin</option>
                                                        </select>
                                                    </td>

                                                    <td>
                                                        <button 
                                                            className="AdminActionBtn danger"
                                                            onClick={() => handleDeleteUser(u.userId)}
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Storefront Banners Tab */}
                        {activeTab === 'banners' && (
                            <div>
                                <div className="SectionHeader">
                                    <div className="AdminHeader" style={{marginBottom: 0}}>
                                        <h1>Promotional Banners</h1>
                                        <p>Manage the dynamic hero banners on the homepage.</p>
                                    </div>
                                    <button className="AdminPrimaryBtn" onClick={() => setIsBannerModalOpen(true)}>
                                        + Add Banner
                                    </button>
                                </div>

                                <div className="AdminTableWrapper">
                                    <table className="AdminTable">
                                        <thead>
                                            <tr>
                                                <th>Preview</th>
                                                <th>Name</th>
                                                <th>Target 1</th>
                                                <th>Target 2</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {banners.map(b => (
                                                <tr key={b.bannerId}>
                                                    <td>
                                                        <img 
                                                            src={b.bannerUrl} 
                                                            alt={b.bannerName} 
                                                            style={{width: '120px', height: '40px', objectFit: 'cover', borderRadius: '4px'}}
                                                        />
                                                    </td>
                                                    <td><strong>{b.bannerName}</strong></td>
                                                    <td>{tshirts.find(t => t.tShirtId === b.team1ID)?.shirtName || (b.team1ID ? `ID: ${b.team1ID}` : 'None')}</td>
                                                    <td>{tshirts.find(t => t.tShirtId === b.team2ID)?.shirtName || (b.team2ID ? `ID: ${b.team2ID}` : 'None')}</td>
                                                    <td>
                                                        <button 
                                                            className="AdminActionBtn danger"
                                                            onClick={() => handleDeleteBanner(b.bannerId)}
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Competitions Management Tab */}
                        {activeTab === 'competitions' && (
                            <div>
                                <div className="SectionHeader">
                                    <div className="AdminHeader" style={{marginBottom: 0}}>
                                        <h1>Competitions & Leagues</h1>
                                        <p>Manage tournaments for organizing jerseys and filter tags.</p>
                                    </div>
                                </div>

                                <div style={{background: '#fff', padding: '24px', borderRadius: '8px', border: '1px solid #e5e7eb', marginBottom: '24px', maxWidth: '600px'}}>
                                    <h3 style={{marginTop: 0, marginBottom: '16px'}}>Add New Competition</h3>
                                    <form onSubmit={handleCreateCompetition} style={{display: 'flex', gap: '10px'}}>
                                        <input 
                                            type="text" 
                                             
                                            value={newCompetitionName}
                                            onChange={(e) => setNewCompetitionName(e.target.value)}
                                            required
                                            style={{flex: 1, padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '6px'}}
                                        />
                                        <button type="submit" className="AdminPrimaryBtn">
                                            Save Competition
                                        </button>
                                    </form>
                                </div>

                                <div className="AdminTableWrapper" style={{maxWidth: '600px'}}>
                                    <table className="AdminTable">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Competition Name</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {competitions.map(c => (
                                                <tr key={c.competitionId}>
                                                    <td>{c.competitionId}</td>
                                                    <td><strong>{c.competitionName}</strong></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Newsletter Broadcast Tab */}
                        {activeTab === 'newsletter' && (
                            <div>
                                <div className="SectionHeader">
                                    <div className="AdminHeader" style={{marginBottom: 0}}>
                                        <h1>Email Newsletter</h1>
                                        <p>Draft and broadcast an email to all active newsletter subscribers.</p>
                                    </div>
                                </div>

                                <div style={{background: '#fff', padding: '24px', borderRadius: '8px', border: '1px solid #e5e7eb', maxWidth: '800px'}}>
                                    <form onSubmit={handleSendNewsletter}>
                                        <div className="InputGroup">
                                            <label>Subject Line *</label>
                                            <input 
                                                type="text" 
                                                 
                                                value={newsletterSubject}
                                                onChange={(e) => setNewsletterSubject(e.target.value)}
                                                required
                                                disabled={isSendingNewsletter}
                                                style={{width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '6px'}}
                                            />
                                        </div>
                                        <div className="InputGroup" style={{marginTop: '20px'}}>
                                            <label>Email Body (HTML Supported) *</label>
                                            <p style={{fontSize: '13px', color: '#6b7280', margin: '4px 0 8px 0'}}>
                                                You can use standard HTML tags like &lt;h1&gt;, &lt;p&gt;, &lt;strong&gt;, and &lt;a&gt;.
                                            </p>
                                            <textarea 
                                                rows="12" 
                                                placeholder="" 
                                                value={newsletterBody}
                                                onChange={(e) => setNewsletterBody(e.target.value)}
                                                required
                                                disabled={isSendingNewsletter}
                                                style={{width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '6px', fontFamily: 'monospace'}}
                                            />
                                        </div>
                                        <div style={{marginTop: '20px', display: 'flex', justifyContent: 'flex-end'}}>
                                            <button 
                                                type="submit" 
                                                className="AdminPrimaryBtn" 
                                                disabled={isSendingNewsletter || !newsletterSubject || !newsletterBody}
                                            >
                                                {isSendingNewsletter ? "Sending Blast..." : "Send to All Subscribers"}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* Invoices Management Tab */}
                        {activeTab === 'invoices' && (
                            <div>
                                <div className="SectionHeader">
                                    <div className="AdminHeader" style={{marginBottom: 0}}>
                                        <h1>Customer Invoices</h1>
                                        <p>View and manage auto-generated PDF invoices for recent orders.</p>
                                    </div>
                                </div>

                                <div className="AdminTableWrapper">
                                    <table className="AdminTable">
                                        <thead>
                                            <tr>
                                                <th>Invoice ID</th>
                                                <th>Date Issued</th>
                                                <th>Customer Email</th>
                                                <th>Total Amount</th>
                                                <th>Status</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {invoices.length === 0 ? (
                                                <tr>
                                                    <td colSpan="6" style={{textAlign: 'center', padding: '20px'}}>No invoices found.</td>
                                                </tr>
                                            ) : (
                                                invoices.map(inv => (
                                                    <tr key={inv.invoiceId}>
                                                        <td><strong>#{inv.invoiceId}</strong></td>
                                                        <td>{new Date(inv.dateIssued || inv.createdDate).toLocaleDateString()}</td>
                                                        <td>{inv.customerEmail || inv.email || "N/A"}</td>
                                                        <td>R {(inv.totalAmount || inv.total || 0).toFixed(2)}</td>
                                                        <td>
                                                            <span className={`StatusBadge ${inv.isPaid || inv.status === 'Paid' ? 'active' : 'inactive'}`}>
                                                                {inv.isPaid || inv.status === 'Paid' ? 'Paid' : 'Pending'}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <button 
                                                                className="AdminActionBtn"
                                                                style={{background: '#10b981', color: 'white'}}
                                                                onClick={() => handleSendInvoice(inv.invoiceId)}
                                                            >
                                                                Email Invoice
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* Modal for creating a new promotional banner */}
            {isBannerModalOpen && (
                <div className="AdminModalOverlay" onClick={() => setIsBannerModalOpen(false)}>
                    <div className="AdminModalForm" onClick={e => e.stopPropagation()}>
                        <div className="AdminHeader">
                            <h2>Add Hero Banner</h2>
                            <p>Upload a banner image and configure click redirection targets.</p>
                        </div>
                        <form onSubmit={handleAddBannerSubmit}>
                            <div className="InputGroup">
                                <label>Banner Name *</label>
                                <input 
                                    type="text" 
                                    required 
                                    value={newBanner.bannerName}
                                    onChange={e => setNewBanner({...newBanner, bannerName: e.target.value})}
                                    
                                />
                            </div>
                            <div className="InputGroup">
                                <label>Banner Image *</label>
                                <ImageUploader 
                                    endpoint="/api/Upload/banner"
                                    multiple={false}
                                    onUploadSuccess={(url) => setNewBanner({...newBanner, bannerUrl: url})}
                                />
                                <input 
                                    type="text" 
                                    required 
                                    value={newBanner.bannerUrl}
                                    onChange={e => setNewBanner({...newBanner, bannerUrl: e.target.value})}
                                    placeholder=""
                                    style={{marginTop: '10px'}}
                                />
                                {newBanner.bannerUrl && (
                                    <div style={{marginTop: '10px', height: '60px', overflow: 'hidden', borderRadius: '4px', border: '1px solid #e5e7eb'}}>
                                        <img src={newBanner.bannerUrl} alt="Banner Preview" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                                    </div>
                                )}
                            </div>
                            <div className="FormRow">
                                <div className="InputGroup">
                                    <label>First Linked Shirt</label>
                                    <select 
                                        value={newBanner.team1ID} 
                                        onChange={e => setNewBanner({...newBanner, team1ID: e.target.value})}
                                    >
                                        <option value="">-- None (Information Only) --</option>
                                        {tshirts.map(t => (
                                            <option key={t.tShirtId} value={t.tShirtId}>
                                                {t.shirtName} ({t.team?.teamName || `Team ${t.teamId}`})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="InputGroup">
                                    <label>Second Linked Shirt (Optional Rivalry)</label>
                                    <select 
                                        value={newBanner.team2ID} 
                                        onChange={e => setNewBanner({...newBanner, team2ID: e.target.value})}
                                    >
                                        <option value="">-- None (Single Product) --</option>
                                        {tshirts.map(t => (
                                            <option key={t.tShirtId} value={t.tShirtId}>
                                                {t.shirtName} ({t.team?.teamName || `Team ${t.teamId}`})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="InputGroup">
                                <label>Description</label>
                                <textarea 
                                    rows="3" 
                                    value={newBanner.bannerDescription}
                                    onChange={e => setNewBanner({...newBanner, bannerDescription: e.target.value})}
                                    placeholder=""
                                />
                            </div>
                            <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px'}}>
                                <button type="button" className="AdminActionBtn" onClick={() => setIsBannerModalOpen(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="AdminPrimaryBtn">
                                    Create Banner
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminPage;
