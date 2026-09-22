import { useState } from "react";

function CheckoutModal({ isOpen, onClose, onSubmit, loading, initialAddress }) {
    const [addressDetails, setAddressDetails] = useState({
        street: "",
        city: "",
        province: "",
        postalCode: ""
    });

    // If initialAddress has a value, maybe prefill it in "street" or a raw address box.
    // For simplicity, we'll let the user fill in the separated boxes, which gives a cleaner address structure.

    const handleChange = (e) => {
        setAddressDetails({
            ...addressDetails,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Use a comma-separated format for the full address string sent to API
        let parts = [];
        if (addressDetails.street) parts.push(addressDetails.street.trim());
        if (addressDetails.city) parts.push(addressDetails.city.trim());
        if (addressDetails.province) parts.push(addressDetails.province.trim());
        if (addressDetails.postalCode) parts.push(addressDetails.postalCode.trim());
        
        const fullAddress = parts.join(", ");
        
        onSubmit(fullAddress);
    };

    if (!isOpen) return null;

    return (
        <div className="AuthOverlay" onClick={onClose} style={{ zIndex: 99999 }}>
            <div className="AuthModal" onClick={(e) => e.stopPropagation()}>
                <button className="AuthCloseBtn" onClick={onClose} aria-label="Close">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>

                <div className="AuthHeader">
                    <h2 className="AuthTitle">Shipping Address</h2>
                    <p className="AuthSubtitle">Please enter your detailed shipping address for courier delivery.</p>
                </div>

                <form className="AuthForm" onSubmit={handleSubmit}>
                    <div className="InputGroup">
                        <label>Street Address / PO Box *</label>
                        <input 
                            type="text" 
                            name="street"
                            value={addressDetails.street}
                            onChange={handleChange}
                            required 
                        />
                    </div>
                    
                    <div className="InputGroup">
                        <label>City / Suburb *</label>
                        <input 
                            type="text" 
                            name="city"
                            value={addressDetails.city}
                            onChange={handleChange}
                            required 
                        />
                    </div>

                    <div className="FormRow">
                        <div className="InputGroup">
                            <label>Province *</label>
                            <select 
                                name="province"
                                value={addressDetails.province}
                                onChange={handleChange}
                                required
                                style={{
                                    width: "100%",
                                    padding: "10px",
                                    border: "1px solid #ddd",
                                    borderRadius: "4px",
                                    fontSize: "14px",
                                    background: "#f9fafb"
                                }}
                            >
                                <option value="" disabled>Select Province</option>
                                <option value="Eastern Cape">Eastern Cape</option>
                                <option value="Free State">Free State</option>
                                <option value="Gauteng">Gauteng</option>
                                <option value="KwaZulu-Natal">KwaZulu-Natal</option>
                                <option value="Limpopo">Limpopo</option>
                                <option value="Mpumalanga">Mpumalanga</option>
                                <option value="North West">North West</option>
                                <option value="Northern Cape">Northern Cape</option>
                                <option value="Western Cape">Western Cape</option>
                            </select>
                        </div>
                        <div className="InputGroup">
                            <label>Postal Code *</label>
                            <input 
                                type="text" 
                                name="postalCode"
                                value={addressDetails.postalCode}
                                onChange={handleChange}
                                required 
                            />
                        </div>
                    </div>

                    <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <button type="submit" className="AuthSubmitBtn" disabled={loading}>
                            {loading ? "Processing..." : "Proceed to Payment"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CheckoutModal;
