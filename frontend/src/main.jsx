import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.jsx'

// Google OAuth client ID used for authenticating users via Google Sign-In
const GOOGLE_CLIENT_ID = "1066087450856-4989e8bcu4rbegsrt0mehl5eb5s1e481.apps.googleusercontent.com";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Provides Google authentication context to the entire application */}
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)
