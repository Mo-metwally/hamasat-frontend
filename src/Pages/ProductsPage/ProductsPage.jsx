import React, { useState, useEffect, useMemo } from "react";
import "./ProductsPage.scss";
import SideBarFilter from "../../Components/ProductComponents/SideBarFilter/SideBarFilter";
import ProdCard from "../../Components/HomeComponents/ProdCard/ProdCard";
import Pagenation from "../../Components/ProductComponents/pagenation/Pagenation";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FaHome } from "react-icons/fa";
import { useSubCategories } from "../../hooks/useCategories";
import { FourSquare } from "react-loading-indicators";
import { ToastContainer } from "react-toastify";
import ProductsSort from "./ProductsSort";
import useTracking from "../../utils/useTracking";

const ProductsPage = ({ products, loading, error, hotName }) => {
    const [sortBy, setSortBy] = useState("newest");
    const [sortOrder, setSortOrder] = useState("asc");
    const navigate = useNavigate();
    const { subcategories, categories } = useSubCategories();
    const { subCatId, subCatName, brandName } = useParams();
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 18;

    useTracking();

    useEffect(() => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }, [currentPage]);

    // Ensure products is always an array, even when it's undefined
    const validProducts = useMemo(() => {
        return Array.isArray(products) ? products : [];
    }, [products]);

    const maxPrice = validProducts.length > 0 ? Math.max(...validProducts.map(p => parseFloat(p.price))) : 0;

    const [priceRange, setPriceRange] = useState([0, maxPrice]);
    const [filteredProducts, setFilteredProductsm] = useState(validProducts);  // Add this line to store filtered products

    useEffect(() => {
        if (validProducts.length > 0) {
            setPriceRange([0, Math.max(...validProducts.map(p => parseFloat(p.price)))]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [validProducts]);

    useEffect(() => {
        setFilteredProductsm(validProducts.filter(
            (product) => parseFloat(product.price) >= priceRange[0] && parseFloat(product.price) <= priceRange[1]
        ));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [priceRange, validProducts]);



    // Sort filtered products
    const sortedProducts = [...filteredProducts].sort((a, b) => {
        if (a.remaining <= 0 && b.remaining > 0) return 1;
        if (b.remaining <= 0 && a.remaining > 0) return -1;

        let result = 0;
        switch (sortBy) {
            case "newest":
                result = new Date(b.createdAt) - new Date(a.createdAt);
                break;
            case "oldest":
                result = new Date(a.createdAt) - new Date(b.createdAt);
                break;
            case "highest-price":
                result = parseFloat(b.price) - parseFloat(a.price);
                break;
            case "lowest-price":
                result = parseFloat(a.price) - parseFloat(b.price);
                break;
            case "top-sold":
                result = b.sold - a.sold;
                break;
            case "offer":
                result = (b.discount || 0) - (a.discount || 0);
                break;
            case "name":
                result = a.name_ar.localeCompare(b.name_ar);
                break;
            default:
                result = 0;
        }

        return sortOrder === "asc" ? result : -result;
    });


    // Get products for the current page
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = sortedProducts.slice(indexOfFirstItem, indexOfLastItem);

    // Recalculate total pages based on filtered products
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);




    const subcategory = subcategories.find(sub => sub.id === subCatId);
    const category = subcategory ? categories.find(category => category.id === subcategory.categoryId) : null;
    const categoryName = category ? category.name_ar : '';

    if (subCatName && !subcategory) {
        navigate("/notfound");
        return null;
    }
    if (subcategory && !category) {
        navigate("/notfound");
        return null;
    }


    if (loading) {
        return (
            <div className="loading">
                <FourSquare color={["#ff6f33"]} />
            </div>
        )
    };
    if (error) return <div>Error: {error}</div>;


    return (
        <>
            <div className="productsPage" dir="rtl" id={subCatId} >
                <div className="productsPage-conatiner" id="productsPage">
                    <SideBarFilter priceRange={priceRange}
                        setPriceRange={setPriceRange}
                        maxPrice={maxPrice}
                        catId={products.categoryId}
                        products={products}
                        setFilteredProductsm={setFilteredProductsm} />
                    <div className="productsPage-conatiner-2">
                        <div className="productsContainer-wrapper">
                            <div className="products-Sort-container"  >
                                <div className="page-hot-links" >
                                    {subCatName && (
                                        <>
                                            <Link to="/" aria-label="الرئيسية"> <FaHome /> </Link>
                                            &gt;
                                            <Link to={`/category/${category.id}/${categoryName}`}>
                                                {categoryName}
                                            </Link>
                                            &gt;
                                            <p>{subCatName}</p>
                                        </>
                                    )}

                                    {brandName && (
                                        <>
                                            <Link to="/" aria-label="الرئيسية"> <FaHome /> </Link>
                                            &gt;
                                            <Link to="/allbrands">كل البراندات</Link>
                                            &gt;
                                            <p>{brandName}</p>
                                        </>
                                    )}
                                    {!brandName && !subCatName && (
                                        <>
                                            <Link to="/" aria-label="الرئيسية"> <FaHome /> </Link>
                                            &gt;
                                            <p>{hotName}</p>
                                        </>
                                    )}
                                </div>

                                <ProductsSort
                                    sortBy={sortBy}
                                    setSortBy={setSortBy}
                                    sortOrder={sortOrder}
                                    setSortOrder={setSortOrder}
                                />
                            </div>

                            <div className="productsContainer">
                                {filteredProducts.length > 0 ? (
                                    currentItems.map((product) => {
                                        // Find the subcategory for the product
                                        const subcategory = subcategories.find(sub => sub.id === product.subcategoryId);
                                        const subcategoryName = subcategory ? subcategory.name_ar : '';

                                        return (
                                            <ProdCard
                                                link={`/subcategory/${product.subcategoryId}/${subcategoryName}/product/${product.id}/${product.name_ar}`}
                                                key={product.id}
                                                id={product.id}
                                                img={product.image}
                                                imgs={product.images}
                                                name={product.name_ar}
                                                description={product.slug}
                                                price={product.price}
                                                salePrice={product.salePrice}
                                                isNew={product.isNew}
                                                isSale={product.isSale}
                                                sizeAr={product.size_ar}
                                                sizeEn={product.size_en}
                                                remaining={product.remaining}
                                            />
                                        );
                                    })
                                ) : (
                                    <p style={{ paddingRight: "1.5rem" }}>لا يوجد منتجات</p>
                                )}
                            </div>
                        </div>
                        <div className="paginationContainer">
                            <Pagenation totalPages={totalPages} currentPage={currentPage} onPageChange={setCurrentPage} />
                        </div>
                    </div>
                </div>
            </div>
            <ToastContainer toastClassName="custom-toast" />
        </>
    );
};

export default ProductsPage;
