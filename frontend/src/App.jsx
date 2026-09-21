import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./AuthContext.jsx";
import { CartProvider } from "./CartContext.jsx";
import { ToastProvider } from "./ToastContext.jsx";
import { ConfirmProvider } from "./ConfirmContext.jsx";
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";
import HomePage from "./HomePage.jsx";
import ProductDetails from "./ProductDetails.jsx";
import RivalryPage from "./RivalryPage.jsx";
import AdminPage from "./AdminPage.jsx";
import ItemListerPage from "./ItemListerPage.jsx";
import CollectionPage from "./CollectionPage.jsx";

// Root application component configuring global providers and page routes
function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <ConfirmProvider>
          <CartProvider>
            <Router>
              <Header />
              <Routes>
                {/* Storefront routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/collections" element={<CollectionPage />} />
                <Route path="/product/:id" element={<ProductDetails />} />
                <Route path="/rivalry/:id1/:id2" element={<RivalryPage />} />

                {/* Management and administration routes */}
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/inventory" element={<ItemListerPage />} />
              </Routes>
              <Footer />
            </Router>
          </CartProvider>
        </ConfirmProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
