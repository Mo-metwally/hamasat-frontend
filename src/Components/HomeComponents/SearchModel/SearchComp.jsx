import React, { useEffect, useRef, useState } from 'react';
import { useSearch } from '../../../Context/SearchContext';
import { useSubCategories } from '../../../hooks/useCategories';
import { IoSearch } from "react-icons/io5";
import { Link, useLocation } from 'react-router-dom';
import ResultsCard from './ResultsCard';
import { IoIosArrowBack } from 'react-icons/io';
import { useProducts } from '../../../hooks/useProducts';

const SearchComp = ({ autoFocus, closeModal }) => {
    const location = useLocation();
    const { products } = useProducts();
    const { subcategories } = useSubCategories();
    const { searchTerm, setSearchTerm, suggestions } = useSearch();
    const [submittedTerm, setSubmittedTerm] = useState('');
    const [hasSearched, setHasSearched] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    
    // Advanced Search State
    const [advancedResults, setAdvancedResults] = useState({ categories: [], subCategories: [], vendors: [], products: [] });
    const [isSearching, setIsSearching] = useState(false);

    const inputRef = useRef(null);
    useEffect(() => {
        if (autoFocus) {
            const timer = setTimeout(() => {
                inputRef.current?.focus();
            }, 100);

            return () => clearTimeout(timer);
        }
    }, [autoFocus]);

    const handleSearch = () => {
        setSubmittedTerm(searchTerm.trim().toLowerCase());
        setHasSearched(true);
        setShowSuggestions(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    // Debounce Advanced Search
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
            fetchAdvancedResults();
        }, 400);

        return () => clearTimeout(timerId);
    }, [searchTerm]);

    const filteredProducts = advancedResults.products || [];
    const productsCount = filteredProducts.length;

    return (
        <div className="search-container">
            <div className="search-input-wrapper">
                <div className="searchInput-Container">
                    <button
                        className="btn border-0 d-flex align-items-center justify-content-center"
                        onClick={handleSearch}
                        style={{background: 'var(--main-color)', fontSize: '1rem', color: '#fff', cursor: 'pointer', margin: 'auto 10px', padding: '5px 15px', borderRadius: '20px'}}
                        title="بحث"
                    >
                        <i className="fi fi-rr-search" style={{marginLeft: '5px'}}></i> بحث
                    </button>
                    <input
                        type="text"
                        className="search-input"
                        placeholder="ابحث عن منتج، قسم، أو بائع..."
                        ref={inputRef}
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setHasSearched(false);
                            setShowSuggestions(true);
                        }}
                        onFocus={() => {
                            setIsFocused(true);
                            setShowSuggestions(true);
                        }}
                        onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                        onKeyDown={handleKeyDown}
                    />
                    <button
                        className="btn border-0 d-flex align-items-center justify-content-center"
                        onClick={closeModal}
                        style={{background: 'var(--body-color)', fontSize: '1.4rem', color: '#666', cursor: 'pointer', margin: 'auto 10px', width: '35px', height: '35px', borderRadius: '50%'}}
                        title="إغلاق البحث"
                    >
                        <i className="fi fi-rr-cross-small"></i>
                    </button>
                </div>

                {showSuggestions && searchTerm.trim() !== '' && !hasSearched && (
                    <div className="search-suggestions-dropdown" dir="rtl">
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
                                                    <Link className="suggestion-item" to={`/category/${cat.id}/${cat.name_ar}`} onClick={() => { setShowSuggestions(false); closeModal(); }}>
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
                                                    <Link className="suggestion-item" to={`/subcategory/${sub.id}/${sub.name_ar}`} onClick={() => { setShowSuggestions(false); closeModal(); }}>
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
                                                    <Link className="suggestion-item" to={`/searchresults?vendorId=${vendor.id}`} onClick={() => { setShowSuggestions(false); closeModal(); }}>
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
                                                        <Link className="suggestion-item" to={`/subcategory/${prod.categoryId}/${subName}/product/${prod.id}/${prod.name_ar}`} onClick={() => { setShowSuggestions(false); closeModal(); }}>
                                                            {prod.image && <img src={prod.image} alt={prod.name_ar} className="suggestion-img" />}
                                                            <span>{prod.name_ar}</span>
                                                        </Link>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>

            <div className="search-results-container">
                {hasSearched ? (
                    (advancedResults.categories?.length > 0 || advancedResults.subCategories?.length > 0 || advancedResults.vendors?.length > 0 || filteredProducts.length > 0) ? (
                        <div className="all-results-view">
                            {advancedResults.categories?.length > 0 && (
                                <div className="result-group">
                                    <h6 className="group-title">الأقسام</h6>
                                    <div className="group-items">
                                        {advancedResults.categories.map(cat => (
                                            <Link key={`cat-res-${cat.id}`} to={`/category/${cat.id}/${cat.name_ar}`} className="result-pill" onClick={() => { setShowSuggestions(false); closeModal(); }}>
                                                {cat.image && <img src={cat.image} alt={cat.name_ar} />}
                                                <span>{cat.name_ar}</span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {filteredProducts.length > 0 && (
                                <div className="result-group">
                                    <h6 className="group-title">المنتجات</h6>
                                    <div className="search-results-grid">
                                        {filteredProducts.map((item) => {
                                            const subcategory = subcategories.find(sub => sub.id === item.subcategoryId) || item.category;
                                            const subcategoryName = subcategory ? subcategory.name_ar : 'منتج';
                                            return (
                                                <Link
                                                    to={`/subcategory/${item.subcategoryId || item.categoryId}/${subcategoryName}/product/${item.id}/${item.name_ar}`}
                                                    state={{ from: location.pathname }}
                                                    key={item.id}
                                                    onClick={() => { setShowSuggestions(false); closeModal(); }}
                                                >
                                                    <ResultsCard id={item.id} item={item} />
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="warnnin-text-container">
                            <p className='warnnin-text'>لا توجد نتائج مطابقة لـ "{submittedTerm}"</p>
                        </div>
                    )
                ) : (
                    <div className="warnnin-text-container">
                        <p className='warnnin-text'>ابدأ بالبحث لاستكشاف المنتجات، الأقسام والبائعين</p>
                    </div>
                )}
            </div>

            {hasSearched && (
                <div className='products-count p-3 border-top'>
                    <p className="products-count-p m-0 text-muted">
                        <small>
                            نتائج البحث: <span><strong style={{color: 'var(--main-color)'}}>{productsCount}</strong> <sup>منتج</sup></span>
                        </small>
                    </p>
                    <Link className='to_search btn btn-sm btn-outline-dark rounded-pill' to={`/searchresults?q=${encodeURIComponent(searchTerm)}`} onClick={closeModal}>
                        جميع النتائج <i className="fi fi-rr-arrow-small-left ms-1"></i>
                    </Link>
                </div>
            )}
        </div>
    );
};

export default SearchComp;
