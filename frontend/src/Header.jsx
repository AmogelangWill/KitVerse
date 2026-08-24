import "./Header.css";
import loupeIcon from "./assets/images/loupe.png";
import heartIcon from "./assets/images/heart.png";
import shoppingBagIcon from "./assets/images/shopping-bag.png";
import userIcon from "./assets/images/user.png";

function Header(){
    return(
      <>    
       <div className="HeaderContainer">
            
            <div className="Logo">
                <h1 className="BrandName">
                    <img className="BrandImg" src="/logo.png" alt="KitVerse Logo" />
                </h1>
            </div>
            
            <nav className="NavButtons">
                <button className="JerseysBtn">
                    Jerseys<img className="DownArrow" src="https://cdn-icons-png.flaticon.com/128/2985/2985150.png" alt="ImgNotFound"></img>
                </button>
                <button className="NewArrivalBtn">
                    New Arrival<img className="DownArrow" src="https://cdn-icons-png.flaticon.com/128/2985/2985150.png" alt="ImgNotFound"></img>
                </button>
                <button className="NedbankCupBtn">
                    Nedbank Cup<img className="DownArrow" src="https://cdn-icons-png.flaticon.com/128/2985/2985150.png" alt="ImgNotFound"></img>
                </button>
                <button className="CAFBtn">
                    CAF<img className="DownArrow" src="https://cdn-icons-png.flaticon.com/128/2985/2985150.png" alt="ImgNotFound"></img>
                </button>
            </nav>
            <div className="Icons">
                <button className="FavouritesBtn"> 
                    <img className="SearchIcon" src={loupeIcon}/>
                </button>
                <button className="SearchBarBtn">
                    <img className="LoveIcon" src={heartIcon}/>
                </button>
                <button className="ShoppingCarBtn">
                    <img className="ShoppingBagIcon" src={shoppingBagIcon}/>
                </button>
                <button className="ProfileBtn">
                     <img className="profileIcon" src={userIcon}/>
                </button>
             </div>  
       </div>
     </>
    );
}
export default Header
