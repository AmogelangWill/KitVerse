import "./ProductMetadata.css";

// Product showcase card rendering sample kit preview, brand, and sizing options
function ProductMetadata() {
    return (
        <div className="ProductDiv">
            <div className="ProductMetaImgWrapper">
                <img 
                    className="ProductImg" 
                    src="/products/Chiefs_Home.png" 
                    alt="Kaizer Chiefs 26/27 Home Jersey"
                />
            </div>
            <p className="ProductDescription">
                Kaizer Chiefs 26/27 Home Jersey
            </p>
            <p className="PBrand">Kappa</p>
            <p className="PPrice">R1299.00</p>
            <div className="SizeOption">
                <button className="BtnSmall">Small</button>
                <button className="BtnMedium">Medium</button>
                <button className="BtnLarge">Large</button>
                <button className="BtnXlarge">X-Large</button>
                <button className="BtnXXLarge">XX-Large</button>
            </div>
            <button className="AddToCart">Add To Cart</button>
        </div>
    );
}

export default ProductMetadata;