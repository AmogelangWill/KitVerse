import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";
import HomePage from "./HomePage.jsx";
import ProductDetails from "./ProductDetails.jsx";

function App(){
   return(
    <Router>
       <Header/>
       <Routes>
           <Route path="/" element={<HomePage />} />
           <Route path="/product/:id" element={<ProductDetails />} />
       </Routes>
       <Footer/>
    </Router>
   )
}
export default App;
