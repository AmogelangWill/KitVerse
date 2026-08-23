import "./ProductsPage.css";

function ProductHPage() {
    const products = [
        {
            id: 1,
            name: "Kaizer Chiefs 26/27 Home Jersey",
            price: "R1299.00",
            image: "/products/Chiefs_Home.png",
        },
        {
            id: 2,
            name: "Orlando Pirates 26/27 Home Jersey",
            price: "R1299.00",
            image: "/products/Pirates_Home.png",
        },
        {
            id: 3,
            name: "Mamelodi Sundowns 26/27 Home Jersey",
            price: "R1299.00",
            image: "/products/Sundowns_Home.png",
        },
        {
            id: 4,
            name: "Mamelodi Sundowns 26/27 Away Jersey",
            price: "R1299.00",
            image: "/products/Sundowns_Away.png",
        },
    ];

    return (
        <div className="BodyWrapper">
            <div className="Description">
                <h2 className="DOutliner">
                    WORLD CUP 26™ Series
                </h2>
                <div className="FilterDiv">
                    <button className="BtnFilter">
                        All Collections
                        <span className="ChevronRight">&gt;</span>
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
                            <div className="ShopNowOverlay">
                                Shop Now <span className="ChevronRight">&gt;</span>
                            </div>
                        </div>
                        <p className="PDescription">{product.name}</p>
                        <p className="PPrice">{product.price}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ProductHPage;
