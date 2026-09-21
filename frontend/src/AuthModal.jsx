import { useState } from "react";
import { useAuth } from "./AuthContext.jsx";
import "./AuthModal.css";
import { GoogleLogin } from "@react-oauth/google";

// Modal dialogue for handling user authentication (Sign In, Registration, and Forgot Password)
function AuthModal({ isOpen, onClose }) {
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [isForgot, setIsForgot] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const apiUrl = import.meta.env.VITE_API_URL || "https://kitverse-production.up.railway.app";

  // Updates controlled input state on field changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Submits email/password credentials to login, registration, or forgot password endpoints
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    if (isForgot) {
      try {
        const res = await fetch(`${apiUrl}/api/Auth/forgot-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: formData.email })
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          setSuccessMsg(data.message || "Password reset link sent! Check your email.");
          setTimeout(() => {
            setIsForgot(false);
            setSuccessMsg("");
          }, 3000);
        } else {
          setErrorMsg(data.message || "Failed to send reset link.");
        }
      } catch (err) {
        setErrorMsg("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
      return;
    }

    const url = isLogin 
      ? `${apiUrl}/api/Auth/login`
      : `${apiUrl}/api/Auth/register`;

    const payload = isLogin
      ? { 
          email: formData.email, 
          password: formData.password,
          username: formData.email
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
        login(data);
        
        // Allow user to read success message before closing modal
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        // Transition to login view after successful registration
        setTimeout(() => {
          setIsLogin(true);
          setSuccessMsg("");
        }, 1500);
      }
      
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Authenticates user with backend via Google OAuth credential token
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      setErrorMsg("");
      const res = await fetch(`${apiUrl}/api/Auth/google-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: credentialResponse.credential })
      });
      const data = await res.json();
      if (res.ok) {
        login(data);
        onClose();
      } else {
        setErrorMsg(data.message || "Google Login failed");
      }
    } catch (err) {
      setErrorMsg("Network error during Google Login");
    } finally {
      setLoading(false);
    }
  };

  // Toggles between Sign In, Sign Up, and Forgot Password views
  const toggleMode = (loginMode) => {
    setIsLogin(loginMode);
    setIsForgot(false);
    setErrorMsg("");
    setSuccessMsg("");
  };

  const toggleForgot = () => {
    setIsForgot(true);
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
          <h2 className="AuthTitle">
            {isForgot ? "Reset Password" : isLogin ? "Sign In" : "Sign Up"}
          </h2>
          <p className="AuthSubtitle">
            {isForgot
              ? "Enter your email and we'll send you a link to reset your password."
              : isLogin 
              ? "Welcome back! Please enter your details." 
              : "Create an account to track orders and save your wishlist."}
          </p>
        </div>

        {errorMsg && <div className="AuthError">{errorMsg}</div>}
        {successMsg && <div className="AuthSuccess">{successMsg}</div>}

        {/* Google OAuth Login Button - Hide if Forgot Password mode */}
        {!isForgot && (
          <>
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '10px' }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setErrorMsg("Google Login was closed or failed.")}
                useOneTap
                shape="rectangular"
                theme="outline"
                size="large"
                text={isLogin ? "signin_with" : "signup_with"}
                width="100%"
              />
            </div>

            <div className="AuthDivider">
              <span>Or {isLogin ? "sign in" : "sign up"} with your email</span>
            </div>
          </>
        )}

        {/* Email & Password Form */}
        <form className="AuthForm" onSubmit={handleSubmit}>
          {!isLogin && !isForgot && (
            <div className="FormRow">
              <div className="InputGroup">
                <label>First name *</label>
                <input 
                  type="text" 
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required={!isLogin && !isForgot} 
                />
              </div>
              <div className="InputGroup">
                <label>Surname *</label>
                <input 
                  type="text" 
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required={!isLogin && !isForgot} 
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

          {!isForgot && (
            <div className="InputGroup">
              <label>Password *</label>
              <input 
                type="password" 
                name="password"
                value={formData.password}
                onChange={handleChange}
                required={!isForgot} 
              />
            </div>
          )}

          {isLogin && !isForgot && (
            <div className="ForgotPassword">
              <button type="button" onClick={toggleForgot} style={{ background: 'none', border: 'none', color: '#2563eb', padding: 0, cursor: 'pointer', textDecoration: 'underline', fontSize: '14px' }}>
                Forgot your password?
              </button>
            </div>
          )}

          <button type="submit" className="AuthSubmitBtn" disabled={loading}>
            {loading ? "Processing..." : (isForgot ? "Send Reset Link" : isLogin ? "Sign In" : "Sign Up")}
          </button>
        </form>

        <div className="AuthFooter">
          {isForgot ? (
            <p>Remembered your password? <button onClick={() => toggleMode(true)} className="ToggleAuthBtn">Sign in</button></p>
          ) : isLogin ? (
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
