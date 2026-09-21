import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { Link } from 'react-router-dom';

function MyOrdersPage() {
    const { user, loading: authLoading } = useAuth();
    const { showToast } = useToast();
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null); // Used to show order details

    useEffect(() => {
        if (!authLoading && user) {
            fetchMyInvoices();
        } else if (!authLoading && !user) {
            setLoading(false);
        }
    }, [user, authLoading]);

    const fetchMyInvoices = async () => {
        try {
            const res = await fetch("https://kitverse-production.up.railway.app/api/Payment/my-invoices", {
                headers: { "Authorization": `Bearer ${user.token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setInvoices(data);
            }
        } catch (error) {
            console.error("Failed to fetch invoices:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadInvoice = async (invoice, e) => {
        e.stopPropagation();
        try {
            const res = await fetch(`https://kitverse-production.up.railway.app/api/Payment/invoice/${invoice.id}/download`, {
                headers: { "Authorization": `Bearer ${user.token}` }
            });
            if (!res.ok) throw new Error("Download failed");
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `KitVerse_Invoice_${invoice.invoiceNumber}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
            showToast("Invoice downloaded successfully!", "success");
        } catch (err) {
            showToast("Failed to download invoice.", "error");
        }
    };

    if (authLoading) return <div style={{padding: '100px', textAlign: 'center'}}>Loading...</div>;
    if (!user) {
        return (
            <div style={{padding: '100px', textAlign: 'center'}}>
                <h2>Please sign in to view your orders.</h2>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px', display: 'flex', gap: '40px' }}>
            {/* Sidebar Menu (Bash Style) */}
            <div style={{ width: '250px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>My Account</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ padding: '12px 16px', background: '#040404', color: 'white', borderRadius: '4px', fontWeight: 'bold' }}>
                        My Orders
                    </div>
                    <Link to="/profile" style={{ padding: '12px 16px', color: '#4b5563', textDecoration: 'none', borderRadius: '4px' }}>
                        Personal Details
                    </Link>
                    <Link to="/address-book" style={{ padding: '12px 16px', color: '#4b5563', textDecoration: 'none', borderRadius: '4px' }}>
                        Address Book
                    </Link>
                    <Link to="/wishlist" style={{ padding: '12px 16px', color: '#4b5563', textDecoration: 'none', borderRadius: '4px' }}>
                        Wishlist
                    </Link>
                </div>
            </div>

            {/* Main Content Area */}
            <div style={{ flex: 1 }}>
                {selectedOrder ? (
                    // ORDER DETAILS VIEW (Bash Style)
                    <div>
                        <button 
                            onClick={() => setSelectedOrder(null)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#040404', fontWeight: 'bold', marginBottom: '24px', padding: 0 }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                            Back to Orders
                        </button>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                            <div>
                                <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>Order {selectedOrder.invoiceNumber}</h1>
                                <p style={{ color: '#6b7280', margin: 0 }}>Placed on {new Date(selectedOrder.invoiceDate).toLocaleDateString()}</p>
                            </div>
                            <button 
                                onClick={(e) => handleDownloadInvoice(selectedOrder, e)}
                                style={{ background: 'white', border: '1px solid #d1d5db', padding: '8px 16px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                                Download Invoice
                            </button>
                        </div>

                        {/* Order Tracker Timeline */}
                        <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '32px', marginBottom: '32px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                                {/* Track lines */}
                                <div style={{ position: 'absolute', top: '12px', left: '10%', right: '10%', height: '4px', background: '#e5e7eb', zIndex: 0 }}></div>
                                <div style={{ position: 'absolute', top: '12px', left: '10%', right: '50%', height: '4px', background: '#040404', zIndex: 0 }}></div>
                                
                                {/* Track points */}
                                {['Order Placed', 'Processing', 'Shipped', 'Delivered'].map((step, idx) => (
                                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, width: '25%' }}>
                                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: idx <= 1 ? '#040404' : '#e5e7eb', border: '4px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px', color: 'white' }}>
                                            {idx <= 1 && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                                        </div>
                                        <span style={{ fontSize: '14px', fontWeight: idx <= 1 ? 'bold' : 'normal', color: idx <= 1 ? '#040404' : '#6b7280' }}>{step}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Order Items</h3>
                        {/* Placeholder items since invoices only hold totals currently */}
                        <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '24px', display: 'flex', gap: '24px' }}>
                            <div style={{ width: '120px', height: '120px', background: '#f3f4f6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M20.38 3.46L16 2a8 8 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l1.42 10.3A2 2 0 0 0 5.67 17H18.33a2 2 0 0 0 1.97-1.01l1.42-10.3a2 2 0 0 0-1.34-2.23z"></path></svg>
                            </div>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 'bold' }}>KitVerse Items</h4>
                                <p style={{ margin: '0 0 4px 0', color: '#6b7280', fontSize: '14px' }}>Order Total includes VAT</p>
                                <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>R {selectedOrder.total?.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    // ORDER LIST VIEW (Bash Style)
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '24px' }}>My Orders</h1>
                        
                        {loading ? (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>Loading orders...</div>
                        ) : invoices.length === 0 ? (
                            <div style={{ padding: '60px 20px', textAlign: 'center', background: '#f9fafb', borderRadius: '8px', border: '1px dashed #d1d5db' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '16px' }}><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                                <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>No orders yet</h3>
                                <p style={{ color: '#6b7280', marginBottom: '24px' }}>When you buy something, your orders will appear here.</p>
                                <Link to="/collections" style={{ display: 'inline-block', background: '#040404', color: 'white', padding: '12px 32px', textDecoration: 'none', fontWeight: 'bold', borderRadius: '4px' }}>
                                    START SHOPPING
                                </Link>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {invoices.map((invoice, index) => (
                                    <div 
                                        key={invoice.id || index} 
                                        onClick={() => setSelectedOrder(invoice)}
                                        style={{
                                            border: '1px solid #e5e7eb', 
                                            borderRadius: '8px', 
                                            padding: '24px', 
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            cursor: 'pointer',
                                            transition: 'border-color 0.2s ease'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.borderColor = '#040404'}
                                        onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                                    >
                                        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                                            <div style={{ width: '80px', height: '80px', background: '#f3f4f6', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.38 3.46L16 2a8 8 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l1.42 10.3A2 2 0 0 0 5.67 17H18.33a2 2 0 0 0 1.97-1.01l1.42-10.3a2 2 0 0 0-1.34-2.23z"></path></svg>
                                            </div>
                                            <div>
                                                <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#6b7280' }}>Order #{invoice.invoiceNumber || 'Pending'}</p>
                                                <p style={{ margin: '0 0 4px 0', fontWeight: 'bold', fontSize: '16px' }}>R {invoice.total ? invoice.total.toFixed(2) : '0.00'}</p>
                                                <p style={{ margin: 0, fontSize: '14px', color: '#4b5563' }}>{new Date(invoice.invoiceDate).toLocaleDateString()}</p>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                                            <span style={{
                                                padding: '6px 12px',
                                                borderRadius: '4px',
                                                fontSize: '12px',
                                                fontWeight: 'bold',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                backgroundColor: invoice.status === 'Paid' || invoice.status === 'Issued' ? '#f3f4f6' : '#fffbeb',
                                                color: '#040404'
                                            }}>
                                                {invoice.status || 'Processing'}
                                            </span>
                                            
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default MyOrdersPage;
