import { useState } from "react";
import { useToast } from "./ToastContext";
import { useAuth } from "./AuthContext";

function OrderCard({ invoice }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const { showToast } = useToast();
    const { user } = useAuth();
    
    // Safely extract items, defaulting to empty array if not returned yet (e.g. backend not deployed)
    const items = invoice.items || [];
    
    // For the collapsed view, determine how many images to show
    const displayItems = items.slice(0, 3);
    const remainingCount = items.length > 3 ? items.length - 3 : 0;

    const handleDownload = async (e) => {
        e.stopPropagation(); // prevent expanding the card when clicking download
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
    };

    return (
        <div 
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
                border: '1px solid #e5e7eb', 
                borderRadius: '8px', 
                padding: '24px', 
                marginBottom: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                background: 'white',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out'
            }}
            onMouseOver={(e) => e.currentTarget.style.borderColor = '#9ca3af'}
            onMouseOut={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
        >
            <div style={{display: 'flex', gap: '20px', alignItems: 'flex-start', borderBottom: '1px solid #f3f4f6', paddingBottom: '16px'}}>
                {/* Images Cluster */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {displayItems.length > 0 ? (
                        displayItems.map((item, idx) => (
                            <img 
                                key={idx} 
                                src={item.imageUrl} 
                                alt={item.productName || "Product"} 
                                style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #eee' }} 
                            />
                        ))
                    ) : (
                        // Fallback if API hasn't updated yet and only provides main imageUrl
                        invoice.imageUrl ? (
                            <img src={invoice.imageUrl} alt="Product" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #eee' }} />
                        ) : (
                            <div style={{ width: '60px', height: '60px', background: '#f3f4f6', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.38 3.46L16 2a8 8 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l1.42 10.3A2 2 0 0 0 5.67 17H18.33a2 2 0 0 0 1.97-1.01l1.42-10.3a2 2 0 0 0-1.34-2.23z"></path></svg>
                            </div>
                        )
                    )}
                    {remainingCount > 0 && (
                        <div style={{ width: '60px', height: '60px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 'bold', color: '#4b5563' }}>
                            +{remainingCount}
                        </div>
                    )}
                </div>

                <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '60px' }}>
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
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
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
                    <svg style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
            </div>

            {/* Expanded Item Details */}
            {isExpanded && items.length > 0 && (
                <div style={{ marginTop: '8px', paddingTop: '16px', borderTop: '1px dashed #e5e7eb' }} onClick={(e) => e.stopPropagation()}>
                    <h4 style={{ margin: '0 0 16px 0', fontSize: '15px' }}>Order Items</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {items.map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: '16px', alignItems: 'center', background: '#f9fafb', padding: '12px', borderRadius: '6px' }}>
                                <img 
                                    src={item.imageUrl} 
                                    alt={item.productName || "Product"} 
                                    style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #e5e7eb' }} 
                                />
                                <div style={{ flex: 1 }}>
                                    <p style={{ margin: '0 0 4px 0', fontWeight: 'bold', fontSize: '14px' }}>{item.productName || 'KitVerse Jersey'}</p>
                                    <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>Qty: {item.quantity}</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ margin: 0, fontWeight: 'bold', fontSize: '14px' }}>R {item.unitPrice ? item.unitPrice.toFixed(2) : '0.00'}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Breakdown Section */}
                    <div style={{ marginTop: '16px', borderTop: '1px solid #f3f4f6', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', color: '#4b5563' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Items Subtotal</span>
                            <span>R {invoice.itemsTotal != null ? invoice.itemsTotal.toFixed(2) : invoice.subtotal.toFixed(2)}</span>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Shipping</span>
                            <span>{invoice.shippingFee === 0 ? "Free" : `R ${invoice.shippingFee?.toFixed(2) || '150.00'}`}</span>
                        </div>
                        
                        {invoice.volumeDiscount > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a' }}>
                                <span>Volume Discount (3+ items)</span>
                                <span>-R {invoice.volumeDiscount.toFixed(2)}</span>
                            </div>
                        )}
                        
                        {invoice.promoDiscount > 0.01 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a' }}>
                                <span>Promo Code Applied</span>
                                <span>-R {invoice.promoDiscount.toFixed(2)}</span>
                            </div>
                        )}
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>VAT (Included)</span>
                            <span>R {invoice.tax?.toFixed(2) || '0.00'}</span>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #f3f4f6', fontWeight: 'bold', fontSize: '16px', color: '#111' }}>
                            <span>Total Paid</span>
                            <span>R {invoice.total?.toFixed(2) || '0.00'}</span>
                        </div>
                    </div>
                </div>
            )}

            <div style={{marginTop: '8px'}} onClick={(e) => e.stopPropagation()}>
                <button 
                    onClick={handleDownload}
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
                        gap: '8px',
                        borderRadius: '4px'
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
    );
}

export default OrderCard;
