import "./ProductsPage.css"
function ProductHPage(){
 return(
    <>
        <div  className="BodyWrapper">
            <div className="Description">
                <p className="DOutliner">
                    CAF 26/27 series
                </p>
                <div className="FilterDiv">
                    <button className="BtnFilter">
                        All Catagories
                        <img className="LeftPointingArrrow" src="https://cdn-icons-png.flaticon.com/128/2985/2985179.png" alt="ImgNotFound"/>
                    </button>
                </div>
            
            </div>
            <div className="ProductsContainer">
                 <div className="Product">
                    <img className="ProductImg"
                     src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSCf_zqcmFNKTRtErogfviQS8QlbmSUreef6xIbwmu81g&s=10"
                     alt="ImgNotFound"
                     />
                     <p className="PDescription">Kaizer Chiefs 26/27 Home Jersey</p>
                     <p className="PBrand">Kappa</p>
                     <p className="PPrice">R1299.00</p>
                     <button className="AddToCart">Add To Cart</button>
                 </div>
                 <div className="Product">
                    <img className="ProductImg"
                     src="https://www.sollymsports.com/wp-content/uploads/2025/07/IMG_0353.webp"
                     alt="ImgNotFound"
                     />
                     <p className="PDescription">Orlando Pirates 26/27 Home Jersey</p>
                     <p className="PBrand">Adidas<img className="AdidasLogo" src="https://toppng.com/uploads/preview/adidas-stripes-png-adidas-logo-without-name-11562924274lgttplq5sq.png"/></p>
                     <p className="PPrice">R1299.00</p>
                      <button className="AddToCart">Add To Cart</button>
                 </div>
                 <div className="Product">
                    <img className="ProductImg"
                     src="https://sundownsfc.store/wp-content/uploads/2023/08/puma-mamelodi-sundowns_home-a-scaled.jpg"
                     alt="ImgNotFound"
                     />
                     <p className="PDescription">Mamelodi Sundowns 26/27 Home Jersey</p>
                     <p className="PBrand">
                        Puma<img className="BrandLogo" src="https://e7.pngegg.com/pngimages/423/448/png-clipart-puma-logo-adidas-clothing-brand-adidas-cat-like-mammal-carnivoran.png"/>
                     </p>
                     <p className="PPrice">R1299.00</p>
                      <button className="AddToCart">Add To Cart</button>
                 </div>
                 <div className="Product">
                    <img className="ProductImg"
                     src="https://sundownsfc.store/wp-content/uploads/2026/08/sundowns-away-kit-2026-207-600x600.png"
                     alt="ImgNotFound"
                     />
                     <p className="PDescription">Mamelodi Sundowns 26/27 Home Jersey</p>
                     <p className="PBrand">
                        Puma<img className="BrandLogo" src="https://e7.pngegg.com/pngimages/423/448/png-clipart-puma-logo-adidas-clothing-brand-adidas-cat-like-mammal-carnivoran.png"/>
                     </p>
                     <p className="PPrice">R1299.00</p>
                      <button className="AddToCart">Add To Cart</button>
                 </div>
                 
                 
            </div>
            

        </div>
    
    </>

 );
}

export default ProductHPage