import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { Link } from 'react-router-dom';
import OrderCard from './OrderCard';

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

    if (authLoading || loading) {
        return (
            <div style={{minHeight: '60vh', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                <p>Loading orders...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div style={{minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
                <h2>Please sign in</h2>
                <p>You need to be logged in to view your orders.</p>
            </div>
        );
    }

    return (
        <div style={{maxWidth: '800px', margin: '40px auto', padding: '0 20px', minHeight: '60vh'}}>
            <h1 style={{fontSize: '28px', marginBottom: '8px'}}>Order History</h1>
            <p style={{color: '#6b7280', marginBottom: '32px'}}>View and manage your recent purchases</p>

            {invoices.length === 0 ? (
                <div style={{textAlign: 'center', padding: '64px 0', background: '#f9fafb', borderRadius: '8px', border: '1px dashed #d1d5db'}}>
                    <svg style={{margin: '0 auto 16px', color: '#9ca3af'}} xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <path d="M16 10a4 4 0 0 1-8 0"></path>
                    </svg>
                    <h3 style={{margin: '0 0 8px 0', fontSize: '18px'}}>No orders found</h3>
                    <p style={{color: '#6b7280', marginBottom: '24px'}}>Looks like you haven't made any purchases yet.</p>
                    <Link to="/collection" style={{display: 'inline-block', background: '#040404', color: 'white', padding: '12px 24px', textDecoration: 'none', fontWeight: 'bold'}}>
                        Start Shopping
                    </Link>
                </div>
            ) : (
                <div style={{marginTop: '32px'}}>
                    {invoices.map((invoice, index) => (
                        <OrderCard key={invoice.id || index} invoice={invoice} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default MyOrdersPage;
