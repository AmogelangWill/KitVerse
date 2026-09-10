import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./AuthContext.jsx";
import { CartProvider } from "./CartContext.jsx";
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";
import HomePage from "./HomePage.jsx";
import ProductDetails from "./ProductDetails.jsx";

function App(){
   return(
    <AuthProvider>
      <CartProvider>
        <Router>
           <Header/>
           <Routes>
               <Route path="/" element={<HomePage />} />
               <Route path="/product/:id" element={<ProductDetails />} />
           </Routes>
           <Footer/>
        </Router>
    </CartProvider>
    </AuthProvider>
   )
}
export default App;
