import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./AuthContext.jsx";
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";
import HomePage from "./HomePage.jsx";
import ProductDetails from "./ProductDetails.jsx";

function App(){
   return(
    <AuthProvider>
        <Router>
           <Header/>
           <Routes>
               <Route path="/" element={<HomePage />} />
               <Route path="/product/:id" element={<ProductDetails />} />
           </Routes>
           <Footer/>
        </Router>
    </AuthProvider>
   )
}
export default App;
