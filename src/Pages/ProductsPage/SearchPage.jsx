import React, { useState, useEffect, useMemo } from "react";
import "./ProductsPage.scss";
import SideBarFilter from "../../Components/ProductComponents/SideBarFilter/SideBarFilter";
import ProdCard from "../../Components/HomeComponents/ProdCard/ProdCard";
import Pagenation from "../../Components/ProductComponents/pagenation/Pagenation";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import { FaHome } from "react-icons/fa";
import { useSubCategories } from "../../hooks/useCategories";
import { useSearch } from "../../Context/SearchContext";
import { IoSearch } from "react-icons/io5";
import { ToastContainer } from "react-toastify";
import { ThreeDot } from "react-loading-indicators";
import ProductsSort from "./ProductsSort";
import { Helmet } from "react-helmet-async";
import useTracking from "../../utils/useTracking";

const SearchPage = ({ products, loading, error, hotName }) => {
    const { subcategories } = useSubCategories();
    const { subCatId, subCatName } = useParams();
    const { searchTerm, setSearchTerm, suggestions } = useSearch();

    const [currentPage, setCurrentPage] = useState(1);
    const [isFocused, setIsFocused] = useState(false);
    const [submittedTerm, setSubmittedTerm] = useState('');
    const [vendorIdFilter, setVendorIdFilter] = useState('');
    const [hasSearched, setHasSearched] = useState(false);
    
    // Advanced search state for page
    const [advancedResults, setAdvancedResults] = useState({ categories: [], subCategories: [], vendors: [], products: [] });
    const [isSearching, setIsSearching] = useState(false);
    const [sortBy, setSortBy] = useState("newest");
    const [sortOrder, setSortOrder] = useState("desc");
    const itemsPerPage = 18;

    const navigate = useNavigate();
    const location = useLocation();

    useTracking();
    // Ensure products is always an array
    const validProducts = useMemo(() => Array.isArray(products) ? products : [], [products]);

    const maxPrice = validProducts.length > 0
        ? Math.max(...validProducts.map(p => parseFloat(p.price)))
        : 0;

    const [priceRange, setPriceRange] = useState([0, maxPrice]);
    const [filteredProducts, setFilteredProducts] = useState(validProducts);

    // Initialize search from ?q in URL
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const q = params.get("q");
        const vId = params.get("vendorId");
        
        if (q) {
            setSearchTerm(q);
            setSubmittedTerm(q.toLowerCase());
            setHasSearched(true);
            setVendorIdFilter(''); // Clear vendor filter if q is present
        } else if (vId) {
            setVendorIdFilter(vId);
            setSubmittedTerm(''); // Clear text search if vendor is selected
            setSearchTerm('');
            setHasSearched(true);
        } else {
            setSubmittedTerm('');
            setVendorIdFilter('');
        }
    }, [location.search]);

    // Advanced search debounce for the page
    useEffect(() => {
        const fetchAdvancedResults = async () => {
            if (!searchTerm.trim()) {
                setAdvancedResults({ categories: [], subCategories: [], vendors: [], products: [] });
                return;
            }
            setIsSearching(true);
            try {
                const res = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/search?q=${encodeURIComponent(searchTerm)}`);
                const data = await res.json();
                if (res.ok && data.success) {
                    setAdvancedResults({
                        categories: data.data.categories || [],
                        subCategories: data.data.subCategories || [],
                        vendors: data.data.vendors || [],
                        products: data.data.products || []
                    });
                }
            } catch (err) {
                console.error("Advanced search error", err);
            } finally {
                setIsSearching(false);
            }
        };

        const timerId = setTimeout(() => {
            if(isFocused) fetchAdvancedResults();
        }, 400);

        return () => clearTimeout(timerId);
    }, [searchTerm, isFocused]);

    useEffect(() => {
        if (validProducts.length > 0) {
            setPriceRange([0, Math.max(...validProducts.map(p => parseFloat(p.price)))]);
        }
    }, [validProducts]);

    useEffect(() => {
        const filtered = validProducts.filter(
            (product) => {
                const price = parseFloat(product.price);
                return price >= priceRange[0] && price <= priceRange[1];
            }
        );
        setFilteredProducts(filtered);
    }, [priceRange, validProducts]);

    if (loading) {
        return (
            <div className='loading'>
                <ThreeDot color="#ff6f33" size="medium" />
            </div>
        )
    };
    if (error) return <div>Error: {error}</div>;


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


    const filteredBySearch = submittedTerm
        ? sortedProducts.filter((product) => {
            const nameEn = product.name_en?.toLowerCase() || '';
            const nameAr = product.name_ar?.toLowerCase() || '';
            const descEn = product.description_en?.toLowerCase() || '';
            const descAr = product.description_ar?.toLowerCase() || '';
            return nameEn.includes(submittedTerm) || nameAr.includes(submittedTerm) || descEn.includes(submittedTerm) || descAr.includes(submittedTerm);
        })
        : vendorIdFilter
        ? sortedProducts.filter((product) => product.vendorId === vendorIdFilter)
        : sortedProducts;

    const productsCount = filteredBySearch.length;
    const totalPages = Math.ceil(productsCount / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredBySearch.slice(indexOfFirstItem, indexOfLastItem);

    const handleSearch = () => {
        const trimmed = searchTerm.trim();
        if (trimmed) {
            navigate(`/searchresults?q=${encodeURIComponent(trimmed)}`);
            setSubmittedTerm(trimmed.toLowerCase());
            setHasSearched(true);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSearch();
    };

    return (
        <>
            <Helmet>
                <title>بحث - همسات هوم</title>
            </Helmet>
            <div className="productsPage" dir="rtl" id={subCatId}>
                <div className="productsPage-conatiner" id="productsPage">

                    <SideBarFilter
                        priceRange={priceRange}
                        setPriceRange={setPriceRange}
                        maxPrice={maxPrice}
                        catId={products.categoryId}
                        products={products}
                        setFilteredProductsm={setFilteredProducts}
                    />
                    <div className="productsPage-conatiner-2">
                        <div className="search-container">
                            <div className="search-input-wrapper">
                                <div className='searchInput-Container'>
                                    <input
                                        type="text"
                                        placeholder="ابحث عن منتجك..."
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            setHasSearched(false);
                                        }}
                                        onFocus={() => setIsFocused(true)}
                                        onBlur={() => setTimeout(() => setIsFocused(false), 100)}
                                        onKeyDown={handleKeyDown}
                                        className="search-input"
                                    />
                                    <button className='S-btn' onClick={handleSearch}>
                                        بحث <IoSearch className='S-btn-icon' />
                                    </button>
                                </div>

                                {isFocused && searchTerm.trim() !== '' && (
                                    <div className="search-suggestions-dropdown" dir="rtl" onMouseDown={(e) => e.preventDefault()}>
                                        {isSearching ? (
                                            <div className="p-3 text-center text-muted">جاري البحث...</div>
                                        ) : (
                                            <>
                                                {advancedResults.categories?.length > 0 && (
                                                    <div className="suggestion-section">
                                                        <h6>الأقسام الرئيسية</h6>
                                                        <ul>
                                                            {advancedResults.categories.map(cat => (
                                                                <li key={`cat-${cat.id}`}>
                                                                    <Link className="suggestion-item" to={`/category/${cat.id}/${cat.name_ar}`} onMouseDown={() => setIsFocused(false)}>
                                                                        {cat.image && <img src={cat.image} alt={cat.name_ar} className="suggestion-img" />}
                                                                        <span>{cat.name_ar}</span>
                                                                    </Link>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}

                                                {advancedResults.subCategories?.length > 0 && (
                                                    <div className="suggestion-section">
                                                        <h6>الفئات الفرعية</h6>
                                                        <ul>
                                                            {advancedResults.subCategories.map(sub => (
                                                                <li key={`sub-${sub.id}`}>
                                                                    <Link className="suggestion-item" to={`/subcategory/${sub.id}/${sub.name_ar}`} onMouseDown={() => setIsFocused(false)}>
                                                                        {sub.image && <img src={sub.image} alt={sub.name_ar} className="suggestion-img" />}
                                                                        <span>{sub.name_ar}</span>
                                                                    </Link>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                                
                                                {advancedResults.vendors?.length > 0 && (
                                                    <div className="suggestion-section">
                                                        <h6>البائعين</h6>
                                                        <ul>
                                                            {advancedResults.vendors.map(vendor => (
                                                                <li key={`ven-${vendor.id}`}>
                                                                    <Link className="suggestion-item" to={`/searchresults?vendorId=${vendor.id}`} onMouseDown={() => setIsFocused(false)}>
                                                                        {vendor.profileImage ? <img src={vendor.profileImage} alt={vendor.name} className="suggestion-img suggestion-img-rounded" /> : <div className="suggestion-img-placeholder">بائع</div>}
                                                                        <span>{vendor.name}</span>
                                                                    </Link>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}

                                                {advancedResults.products?.length > 0 && (
                                                    <div className="suggestion-section">
                                                        <h6>المنتجات</h6>
                                                        <ul>
                                                            {advancedResults.products.slice(0, 5).map(prod => {
                                                                const subName = prod.category?.name_ar || 'تفاصيل';
                                                                return (
                                                                    <li key={`prod-${prod.id}`}>
                                                                        <Link className="suggestion-item" to={`/subcategory/${prod.categoryId}/${subName}/product/${prod.id}/${prod.name_ar}`} onMouseDown={() => setIsFocused(false)}>
                                                                            {prod.image && <img src={prod.image} alt={prod.name_ar} className="suggestion-img" />}
                                                                            <span>{prod.name_ar}</span>
                                                                        </Link>
                                                                    </li>
                                                                );
                                                            })}
                                                        </ul>
                                                    </div>
                                                )}

                                                {advancedResults.categories?.length === 0 && advancedResults.subCategories?.length === 0 && advancedResults.vendors?.length === 0 && advancedResults.products?.length === 0 && (
                                                    <div className="p-3 text-center text-muted">لا توجد اقتراحات مطابقة</div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="products-Sort-container">
                            <div className="page-hot-links">
                                <Link to="/" aria-label="الرئيسية"> <FaHome /> </Link>
                                &gt;
                                <p>{subCatName || hotName}</p>
                            </div>

                            <ProductsSort
                                sortBy={sortBy}
                                setSortBy={setSortBy}
                                sortOrder={sortOrder}
                                setSortOrder={setSortOrder}
                            />
                        </div>

                        <div className="productsContainer">
                            {currentItems.length > 0 ? (
                                currentItems.map((product) => {
                                    const subcategory = subcategories.find(sub => sub.id === product.subcategoryId);
                                    const subcategoryName = subcategory ? subcategory.name_ar : '';

                                    return (
                                        <ProdCard
                                            key={product.id}
                                            link={`/subcategory/${product.subcategoryId}/${subcategoryName}/product/${product.id}/${product.name_ar}`}
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
                                <p>لا توجد منتجات مطابقة حالياً.</p>
                            )}
                        </div>
                    </div>
                </div>

                <Pagenation
                    totalPages={totalPages}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                />
            </div>
            <ToastContainer toastClassName="custom-toast" />
        </>
    );
};

export default SearchPage;
