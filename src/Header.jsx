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
                    <img className="LoveIcon" src="https://cdn-icons-png.flaticon.com/128/130/130195.png"/>
                </button>
                <button className="SearchBarBtn">
                    <img className="SearchIcon" src="https://cdn-icons-png.flaticon.com/128/5636/5636698.png"/>
                </button>
                <button className="ShoppingCarBtn">

                    <img className="SearchIcon" src="https://cdn-icons-png.flaticon.com/128/7640/7640571.png"/>
                </button>
                <button className="ProfileBtn">
                     <img className="SearchIcon" src="https://cdn-icons-png.flaticon.com/128/1144/1144760.png"/>
                </button>
                 
             </div>  
       </div>
      

     </>
    );
}
export default Header