import { useState } from "react";
import { useAuth } from "./AuthContext.jsx";
import "./AuthModal.css";

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

  const handleGoogleAuth = () => {
    // Backend team can trigger Google OAuth here
    console.log("Google auth clicked");
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

        <button className="GoogleBtn" type="button" onClick={handleGoogleAuth}>
          <svg className="GoogleIcon" viewBox="0 0 24 24">
            <path d="M23.52 12.273c0-.85-.077-1.668-.218-2.455H12v4.642h6.458c-.278 1.5-1.124 2.771-2.395 3.622v3.01h3.878c2.269-2.09 3.579-5.166 3.579-8.819z" fill="#4285F4"/>
            <path d="M12 24c3.24 0 5.956-1.074 7.942-2.907l-3.878-3.01c-1.075.72-2.449 1.145-4.064 1.145-3.125 0-5.771-2.11-6.715-4.947H1.276v3.11C3.251 21.31 7.309 24 12 24z" fill="#34A853"/>
            <path d="M5.285 14.281c-.24-.72-.376-1.489-.376-2.28 0-.792.136-1.561.376-2.281v-3.11H1.276A11.966 11.966 0 0 0 0 12c0 1.936.464 3.77 1.276 5.39l4.009-3.109z" fill="#FBBC05"/>
            <path d="M12 4.773c1.762 0 3.344.605 4.587 1.795l3.442-3.442C17.951 1.19 15.234 0 12 0 7.309 0 3.251 2.69 1.276 6.611l4.009 3.109c.944-2.837 3.59-4.947 6.715-4.947z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

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
