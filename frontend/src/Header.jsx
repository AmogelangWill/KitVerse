import "./Header.css"
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
                    <img className="SearchIcon" src="./assets/images/loupe.png"/>
                </button>
                <button className="SearchBarBtn">
                    <img className="LoveIcon" src="./assets/images/heart.png"/>
                </button>
                <button className="ShoppingCarBtn">

                    <img className="ShoppingBagIcon" src="./assets/images/shopping-bag.png"/>
                </button>
                <button className="ProfileBtn">
                     <img className="profileIcon" src="./assets/images/user.png"/>
                </button>
                 
             </div>  
       </div>
      

     </>
    );
}
export default Header
