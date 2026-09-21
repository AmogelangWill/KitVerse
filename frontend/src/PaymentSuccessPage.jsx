import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';

// Page shown after returning from Paystack - verifies payment and shows result
function PaymentSuccessPage() {
    const [searchParams] = useSearchParams();
    const { user } = useAuth();
    const [status, setStatus] = useState('verifying'); // 'verifying' | 'success' | 'failed'

    useEffect(() => {
        const reference = searchParams.get('reference') || searchParams.get('trxref');
        const cartId = searchParams.get('cartId');

        if (!reference || !cartId) {
            setStatus('failed');
            return;
        }

        const verify = async () => {
            try {
                const token = user?.token || JSON.parse(localStorage.getItem('kitverse_user') || '{}')?.token;
                const res = await fetch(
                    `https://kitverse-production.up.railway.app/api/Payment/verify/${reference}/${cartId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setStatus(res.ok ? 'success' : 'failed');
            } catch {
                setStatus('failed');
            }
        };

        verify();
    }, [searchParams, user]);

    return (
        <div style={{
            minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '40px 20px', textAlign: 'center'
        }}>
            {status === 'verifying' && (
                <div>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
                    <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Verifying your payment...</h2>
                    <p style={{ color: '#6b7280' }}>Please wait while we confirm your order.</p>
                </div>
            )}

            {status === 'success' && (
                <div>
                    <div style={{ fontSize: '64px', marginBottom: '16px' }}>✅</div>
                    <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '12px' }}>Order Confirmed!</h1>
                    <p style={{ fontSize: '16px', color: '#4b5563', marginBottom: '8px' }}>
                        Your payment was successful. A PDF invoice has been emailed to you.
                    </p>
                    <p style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '32px' }}>
                        Check your inbox (and spam folder) for your KitVerse invoice.
                    </p>
                    <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link to="/collections" style={{
                            background: '#040404', color: 'white',
                            padding: '12px 28px', textDecoration: 'none',
                            fontWeight: 'bold', fontSize: '14px'
                        }}>
                            CONTINUE SHOPPING
                        </Link>
                        <Link to="/my-orders" style={{
                            background: 'white', color: '#040404',
                            padding: '12px 28px', textDecoration: 'none',
                            fontWeight: 'bold', fontSize: '14px',
                            border: '2px solid #040404'
                        }}>
                            VIEW MY ORDERS
                        </Link>
                    </div>
                </div>
            )}

            {status === 'failed' && (
                <div>
                    <div style={{ fontSize: '64px', marginBottom: '16px' }}>❌</div>
                    <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '12px' }}>Payment Not Confirmed</h1>
                    <p style={{ fontSize: '16px', color: '#4b5563', marginBottom: '32px' }}>
                        Something went wrong verifying your payment. If money was deducted, please contact support.
                    </p>
                    <Link to="/" style={{
                        background: '#040404', color: 'white',
                        padding: '12px 28px', textDecoration: 'none',
                        fontWeight: 'bold', fontSize: '14px'
                    }}>
                        RETURN HOME
                    </Link>
                </div>
            )}
        </div>
    );
}

export default PaymentSuccessPage;
