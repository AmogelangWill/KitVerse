import "./ProductsPage.css";

function ProductHPage() {
    const products = [
        {
            id: 1,
            name: "Kaizer Chiefs 26/27 Home Jersey",
            brand: "Kappa",
            price: "R1299.00",
            image: "/products/Chiefs_Home.png",
            brandLogo: null,
        },
        {
            id: 2,
            name: "Orlando Pirates 26/27 Home Jersey",
            brand: "Adidas",
            price: "R1299.00",
            image: "/products/Pirates_Home.png",
            brandLogo: "https://toppng.com/uploads/preview/adidas-stripes-png-adidas-logo-without-name-11562924274lgttplq5sq.png",
        },
        {
            id: 3,
            name: "Mamelodi Sundowns 26/27 Home Jersey",
            brand: "Puma",
            price: "R1299.00",
            image: "/products/Sundowns_Home.png",
            brandLogo: "https://e7.pngegg.com/pngimages/423/448/png-clipart-puma-logo-adidas-clothing-brand-adidas-cat-like-mammal-carnivoran.png",
        },
        {
            id: 4,
            name: "Mamelodi Sundowns 26/27 Away Jersey",
            brand: "Puma",
            price: "R1299.00",
            image: "/products/Sundowns_Away.png",
            brandLogo: "https://e7.pngegg.com/pngimages/423/448/png-clipart-puma-logo-adidas-clothing-brand-adidas-cat-like-mammal-carnivoran.png",
        },
    ];

    return (
        <div className="BodyWrapper">
            <div className="Description">
                <p className="DOutliner">
                    CAF 26/27 series
                </p>
                <div className="FilterDiv">
                    <button className="BtnFilter">
                        All Categories
                        <img 
                            className="LeftPointingArrrow" 
                            src="https://cdn-icons-png.flaticon.com/128/2985/2985179.png" 
                            alt="Filter Arrow"
                        />
                    </button>
                </div>
            </div>

            <div className="ProductsContainer">
                {products.map((product) => (
                    <div className="Product" key={product.id}>
                        <div className="ProductImgWrapper">
                            <img
                                className="ProductImg"
                                src={product.image}
                                alt={product.name}
                                loading="lazy"
                            />
                        </div>
                        <p className="PDescription">{product.name}</p>
                        <p className="PBrand">
                            {product.brand}
                            {product.brandLogo && (
                                <img className="BrandLogo" src={product.brandLogo} alt={product.brand} />
                            )}
                        </p>
                        <p className="PPrice">{product.price}</p>
                        <button className="AddToCart">Add To Cart</button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ProductHPage;