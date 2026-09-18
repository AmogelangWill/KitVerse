import { useState } from "react";
import { useAuth } from "./AuthContext.jsx";
import "./AuthModal.css";
import { GoogleLogin } from "@react-oauth/google";

function AuthModal({ isOpen, onClose }) {
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    const url = isLogin 
      ? "https://kitverse-production.up.railway.app/api/Auth/login"
      : "https://kitverse-production.up.railway.app/api/Auth/register";

    const payload = isLogin
      ? { 
          email: formData.email, 
          password: formData.password,
          username: formData.email // Backend DTO has this
        }
      : { 
          userName: formData.firstName, 
          userSurname: formData.lastName,
          userEmail: formData.email, 
          password: formData.password 
        };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong!");
      }

      setSuccessMsg(isLogin ? "Login successful!" : "Account created successfully! You can now sign in.");
      
      if (isLogin) {
        // Save the JWT token and user info into our AuthContext!
        login(data);
        
        // Close modal after a short delay on successful login
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        // Switch to login view after successful registration
        setTimeout(() => {
          setIsLogin(true);
          setSuccessMsg("");
        }, 2000);
      }
      
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      setErrorMsg("");
      const res = await fetch("https://kitverse-production.up.railway.app/api/Auth/google-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: credentialResponse.credential })
      });
      const data = await res.json();
      if (res.ok) {
        login(data);
        onClose();
        if (data.needsPassword) {
          // Ideally we prompt for a password here, but the backend set-password is unprotected
          // For now, they are fully logged in and can use the app normally!
        }
      } else {
        setErrorMsg(data.message || "Google Login failed");
      }
    } catch (err) {
      setErrorMsg("Network error during Google Login");
    } finally {
      setLoading(false);
    }
  };

  // Reset states when switching between login/register
  const toggleMode = (loginMode) => {
    setIsLogin(loginMode);
    setErrorMsg("");
    setSuccessMsg("");
  };

  if (!isOpen) return null;

  return (
    <div className="AuthOverlay" onClick={onClose}>
      <div className="AuthModal" onClick={(e) => e.stopPropagation()}>
        <button className="AuthCloseBtn" onClick={onClose} aria-label="Close">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div className="AuthHeader">
          <h2 className="AuthTitle">{isLogin ? "Sign In" : "Sign Up"}</h2>
          <p className="AuthSubtitle">
            {isLogin 
              ? "Welcome back! Please enter your details." 
              : "Create an account to track orders and save your wishlist."}
          </p>
        </div>

        {errorMsg && <div className="AuthError">{errorMsg}</div>}
        {successMsg && <div className="AuthSuccess">{successMsg}</div>}

        <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '10px' }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setErrorMsg("Google Login was closed or failed.")}
            useOneTap
            shape="rectangular"
            theme="outline"
            size="large"
            text="continue_with"
            width="100%"
          />
        </div>

        <div className="AuthDivider">
          <span>Or {isLogin ? "sign in" : "sign up"} with your email</span>
        </div>

        <form className="AuthForm" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="FormRow">
              <div className="InputGroup">
                <label>First name *</label>
                <input 
                  type="text" 
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required={!isLogin} 
                />
              </div>
              <div className="InputGroup">
                <label>Surname *</label>
                <input 
                  type="text" 
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required={!isLogin} 
                />
              </div>
            </div>
          )}

          <div className="InputGroup">
            <label>Email address *</label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              required 
            />
          </div>

          <div className="InputGroup">
            <label>Password *</label>
            <input 
              type="password" 
              name="password"
              value={formData.password}
              onChange={handleChange}
              required 
            />
          </div>

          {isLogin && (
            <div className="ForgotPassword">
              <a href="#">Forgot your password?</a>
            </div>
          )}

          <button type="submit" className="AuthSubmitBtn" disabled={loading}>
            {loading ? "Processing..." : (isLogin ? "Sign In" : "Sign Up")}
          </button>
        </form>

        <div className="AuthFooter">
          {isLogin ? (
            <p>New here? <button onClick={() => toggleMode(false)} className="ToggleAuthBtn">Create an account</button></p>
          ) : (
            <p>Already have an account? <button onClick={() => toggleMode(true)} className="ToggleAuthBtn">Sign in</button></p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthModal;
