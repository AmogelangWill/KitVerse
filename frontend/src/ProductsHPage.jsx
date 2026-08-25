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

    const betwayProducts = Array.from({ length: 8 }, (_, index) => ({
        id: `betway-${index + 1}`,
        name: "Betway Premiership Jersey Placeholder",
        price: "R0.00",
        image: "https://images.unsplash.com/photo-1577223625816-7546f13df25d?q=80&w=600&auto=format&fit=crop", 
    }));

    return (
        <div className="BodyWrapper">
            {/* CAF SERIES SECTION */}
            <div className="Description">
                <h2 className="DOutliner">
                    CAF 26/27 series
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

            {/* BETWAY PREMIERSHIP SERIES SECTION */}
            <div className="Description" style={{ marginTop: "60px" }}>
                <h2 className="DOutliner">
                    BETWAY PREMIERSHIP SERIES
                </h2>
                <div className="FilterDiv">
                    <button className="BtnFilter">
                        All Collections
                        <span className="ChevronRight">&gt;</span>
                    </button>
                </div>
            </div>

            <div className="ProductsContainer">
                {betwayProducts.map((product) => (
                    <div className="Product" key={product.id}>
                        <div className="ProductImgWrapper">
                            <img
                                className="ProductImg"
                                src={product.image}
                                alt={product.name}
                                loading="lazy"
                                style={{ opacity: 0.5 }} // Makes it look more like a placeholder
                            />
                            <div className="ShopNowOverlay">
                                Shop Now <span className="ChevronRight">&gt;</span>
                            </div>
                        </div>
                        <p className="PDescription" style={{ color: "#888" }}>{product.name}</p>
                        <p className="PPrice" style={{ color: "#888" }}>{product.price}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ProductHPage;
