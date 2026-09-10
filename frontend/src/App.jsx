import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./AuthContext.jsx";
import { CartProvider } from "./CartContext.jsx";
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";
import HomePage from "./HomePage.jsx";
import ProductDetails from "./ProductDetails.jsx";
import RivalryPage from "./RivalryPage.jsx";
import AdminPage from "./AdminPage.jsx";
import ItemListerPage from "./ItemListerPage.jsx";

function App(){
   return(
    <AuthProvider>
      <CartProvider>
        <Router>
           <Header/>
           <Routes>
               <Route path="/" element={<HomePage />} />
               <Route path="/product/:id" element={<ProductDetails />} />
               <Route path="/rivalry/:id1/:id2" element={<RivalryPage />} />
               <Route path="/admin" element={<AdminPage />} />
               <Route path="/inventory" element={<ItemListerPage />} />
           </Routes>
           <Footer/>
        </Router>
    </CartProvider>
    </AuthProvider>
   )
}
export default App;
