import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { Link } from 'react-router-dom';

function MyOrdersPage() {
    const { user, loading: authLoading } = useAuth();
    const { showToast } = useToast();
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);

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
                headers: {
                    "Authorization": `Bearer ${user.token}`
                }
            });
            if (res.ok) {
                const data = await res.json();
                setInvoices(data);
            } else if (res.status === 404) {
                // Endpoint missing
                showToast("Backend endpoint missing: Phathu needs to add 'my-invoices' to PaymentController.", "error");
            }
        } catch (error) {
            console.error("Failed to fetch invoices:", error);
        } finally {
            setLoading(false);
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
        <div style={{maxWidth: '1000px', margin: '40px auto', padding: '0 20px'}}>
            <h1 style={{fontSize: '28px', marginBottom: '8px', borderBottom: '2px solid #040404', paddingBottom: '16px'}}>My Orders & Invoices</h1>
            
            {loading ? (
                <div style={{padding: '50px', textAlign: 'center'}}>Loading orders...</div>
            ) : invoices.length === 0 ? (
                <div style={{padding: '50px', textAlign: 'center', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', marginTop: '32px'}}>
                    <h3 style={{fontSize: '20px', marginBottom: '16px'}}>You haven't placed any orders yet.</h3>
                    <Link to="/collection" style={{display: 'inline-block', background: '#040404', color: 'white', padding: '12px 24px', textDecoration: 'none', fontWeight: 'bold'}}>
                        Start Shopping
                    </Link>
                </div>
            ) : (
                <div style={{marginTop: '32px'}}>
                    {invoices.map((invoice, index) => (
                        <div key={invoice.id || index} style={{
                            border: '1px solid #e5e7eb', 
                            borderRadius: '8px', 
                            padding: '24px', 
                            marginBottom: '24px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '16px',
                            background: 'white',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                        }}>
                            <div style={{display: 'flex', gap: '20px', alignItems: 'center', borderBottom: '1px solid #f3f4f6', paddingBottom: '16px'}}>
                                {invoice.imageUrl ? (
                                    <img src={invoice.imageUrl} alt="Product" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' }} />
                                ) : (
                                    <div style={{ width: '80px', height: '80px', background: '#f3f4f6', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.38 3.46L16 2a8 8 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l1.42 10.3A2 2 0 0 0 5.67 17H18.33a2 2 0 0 0 1.97-1.01l1.42-10.3a2 2 0 0 0-1.34-2.23z"></path></svg>
                                    </div>
                                )}
                                <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <p style={{margin: '0 0 4px 0', fontSize: '14px', color: '#6b7280'}}>Order Number</p>
                                        <p style={{margin: 0, fontWeight: 'bold', fontSize: '16px'}}>{invoice.invoiceNumber || 'Pending'}</p>
                                    </div>
                                    <div style={{textAlign: 'right'}}>
                                        <p style={{margin: '0 0 4px 0', fontSize: '14px', color: '#6b7280'}}>Date Placed</p>
                                        <p style={{margin: 0, fontWeight: 'bold', fontSize: '16px'}}>
                                            {new Date(invoice.invoiceDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                <div>
                                    <p style={{margin: '0 0 4px 0', fontSize: '14px', color: '#6b7280'}}>Total Amount</p>
                                    <p style={{margin: 0, fontWeight: 'bold', fontSize: '20px'}}>R {invoice.total ? invoice.total.toFixed(2) : '0.00'}</p>
                                </div>
                                <div>
                                    <span style={{
                                        display: 'inline-block',
                                        padding: '6px 12px',
                                        borderRadius: '999px',
                                        fontSize: '14px',
                                        fontWeight: 'bold',
                                        backgroundColor: invoice.status === 'Paid' ? '#dcfce3' : '#fef3c7',
                                        color: invoice.status === 'Paid' ? '#166534' : '#92400e'
                                    }}>
                                        {invoice.status || 'Processing'}
                                    </span>
                                </div>
                            </div>

                            <div style={{marginTop: '16px'}}>
                                <button 
                                    onClick={async () => {
                                        try {
                                            console.log("Downloading invoice ID:", invoice.id);
                                            const res = await fetch(`https://kitverse-production.up.railway.app/api/Payment/invoice/${invoice.id}/download`, {
                                                headers: { "Authorization": `Bearer ${user.token}` }
                                            });
                                            if (!res.ok) {
                                                const text = await res.text();
                                                console.error("Download failed:", res.status, text);
                                                throw new Error(`Download failed: ${res.status} ${text}`);
                                            }
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
                                            console.error(err);
                                            showToast(err.message || "Failed to download invoice.", "error");
                                        }
                                    }}
                                    style={{
                                        background: '#040404', 
                                        color: 'white', 
                                        border: 'none', 
                                        padding: '10px 20px', 
                                        cursor: 'pointer',
                                        fontWeight: 'bold',
                                        width: '100%',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                        <polyline points="7 10 12 15 17 10"></polyline>
                                        <line x1="12" y1="15" x2="12" y2="3"></line>
                                    </svg>
                                    Download Invoice PDF
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default MyOrdersPage;
