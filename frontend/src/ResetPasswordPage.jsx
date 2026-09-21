import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import "./AuthModal.css"; // Reusing the modal styles

// Dedicated page for handling password reset via email link token
function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (!token) {
      setErrorMsg("Invalid or missing reset token. Please request a new link.");
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;
    
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }
    
    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/Auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });

      let data = {};
      try {
        data = await response.json();
      } catch (err) {
        // Backend didn't return valid JSON
        console.warn("Non-JSON response from backend");
      }

      if (!response.ok) {
        throw new Error(data.message || data.msg || "Failed to reset password. The link may be expired.");
      }

      setSuccessMsg(data.msg || "Password reset successfully! You can now sign in.");
      
      // Navigate to home after success (where they can open the sign-in modal)
      setTimeout(() => {
        navigate("/");
      }, 3000);
      
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh", padding: "2rem" }}>
      <div className="AuthModal" style={{ position: "relative", transform: "none", top: 0, left: 0, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}>
        <div className="AuthHeader">
          <h2 className="AuthTitle">Reset Password</h2>
          <p className="AuthSubtitle">Create a new secure password for your account.</p>
        </div>

        {errorMsg && <div className="AuthError">{errorMsg}</div>}
        {successMsg && <div className="AuthSuccess">{successMsg}</div>}

        <form className="AuthForm" onSubmit={handleSubmit}>
          <div className="InputGroup">
            <label>New Password *</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              disabled={!token || successMsg}
              placeholder="Min 8 characters"
            />
          </div>

          <div className="InputGroup">
            <label>Confirm Password *</label>
            <input 
              type="password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required 
              disabled={!token || successMsg}
            />
          </div>

          <button type="submit" className="AuthSubmitBtn" disabled={loading || !token || successMsg}>
            {loading ? "Processing..." : "Reset Password"}
          </button>
        </form>
        
        <div className="AuthFooter">
          <p><Link to="/" style={{ color: "#2563eb", textDecoration: "none", fontWeight: 600 }}>Return to Home</Link></p>
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
