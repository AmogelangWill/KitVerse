import Banner from "./Banner.jsx";
import ProductHPage from "./ProductsHPage.jsx";
import PreFooterBanner from "./PreFooterBanner.jsx";

// Main storefront landing page combining the hero banner, curated collections, and store guarantee highlights
function HomePage() {
    return (
        <>
            <Banner />
            <ProductHPage />
            <PreFooterBanner />
        </>
    );
}

export default HomePage;
