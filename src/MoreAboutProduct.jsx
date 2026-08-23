

function ProductMetadta(){
    return(
       <>
        <div className="ProductDiv">
             <img className="ProductImg"  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSCf_zqcmFNKTRtErogfviQS8QlbmSUreef6xIbwmu81g&s=10" />
             <p className="ProductDescription">
                Kaizer Chiefs 26/27 Home Jerseys
             </p>
             <p className="PBrand">Kappa</p>
             <p className="PPrice">R1299</p>
             <div className="SizeOption">
                <button className="BtnSmall">Small</button>
                <button className="BtnMedium">Medium</button>
                <button className="BtnLarge">Large</button>
                <button className="BtnXlarge">X-Large</button>
                <button className="BtnXXLarge">XX-large</button>
             </div>
             <button className="AddToCart">Add To Cart</button>
        </div>
       
       </>
    );
}
export default ProductMetadta