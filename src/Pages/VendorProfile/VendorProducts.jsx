import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import { FaSearch, FaStore, FaBriefcase, FaInfoCircle } from 'react-icons/fa';
import ProdCard from '../../Components/HomeComponents/ProdCard/ProdCard';
import Pagenation from '../../Components/ProductComponents/pagenation/Pagenation';
// import { ThreeDot } from 'react-loading-indicators';
import { useSubCategories } from '../../hooks/useCategories';
import './VendorProfile.scss'; // Reusing header styles from VendorProfile
import './VendorProducts.scss'; // Grid and search bar styles

const VendorProducts = ({ products = [] }) => {
  const { id } = useParams();
  const { subcategories, brands } = useSubCategories();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 18;

  // Fetch vendor info for the header
  useEffect(() => {
    const fetchVendor = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/users/vendor/${id}`);
        setVendor(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'عذراً، حدث خطأ في استرجاع بيانات البائع');
      } finally {
        setLoading(false);
      }
    };

    fetchVendor();
  }, [id]);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  if (loading) {
    return (
      <div className="vendor-profile-loading">
        <div className="spinner"></div>
        <p>جاري تحميل المنتجات...</p>
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div className="vendor-profile-error">
        <h2>عذراً!</h2>
        <p>{error || 'لم يتم العثور على البائع'}</p>
        <Link to="/" className="btn-return">العودة للرئيسية</Link>
      </div>
    );
  }

  const canonicalUrl = `${process.env.REACT_APP_CLIENT_URL || 'https://hamsathome.com'}/vendor/${id}/products`;
  const vendorDesc = vendor.vendorDescription ? vendor.vendorDescription.replace(/<[^>]*>?/gm, '').substring(0, 160) : `تصفح أحدث المنتجات والعروض من متجر ${vendor.name} على همسات هوم. تشكيلة مميزة من المنتجات المتوفرة بأفضل الأسعار.`;

  // Filter products that belong to this vendor
  const vendorProducts = products.filter(p => p.vendorId === id);

  // Filter by local search term
  const displayProducts = vendorProducts.filter(p => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const nameAr = p.name_ar?.toLowerCase() || '';
    const nameEn = p.name_en?.toLowerCase() || '';
    return nameAr.includes(term) || nameEn.includes(term);
  });

  // Find matching brand image for this vendor
  const matchedBrand = brands?.find(b =>
    (b.name && vendor?.name && b.name.trim().toLowerCase() === vendor.name.trim().toLowerCase()) ||
    (b.name_ar && vendor?.name && b.name_ar.trim().toLowerCase() === vendor.name.trim().toLowerCase()) ||
    (b.vendorId && vendor?.id && b.vendorId === vendor.id)
  );
  const brandImage = matchedBrand?.image || vendor?.profileImage || vendor?.image;

  const totalPages = Math.ceil(displayProducts.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = displayProducts.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="vendor-profile-page vendor-products-page">
      <Helmet>
        <meta charSet="UTF-8" />
        <title>منتجات {vendor.name} - متجر همسات هوم</title>
        <meta name="description" content={vendorDesc} />
        <meta name="keywords" content={`منتجات ${vendor.name}, متجر ${vendor.name}, ${vendor.businessField || 'أدوات منزلية'}, همسات هوم, شراء أونلاين, تسوق, أفضل الأسعار`} />

        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <link rel="canonical" href={canonicalUrl} />

        <meta property="og:type" content="website" />
        <meta property="og:title" content={`منتجات ${vendor.name} - متجر همسات هوم`} />
        <meta property="og:description" content={vendorDesc} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content="همسات هوم" />

        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={`منتجات ${vendor.name} - متجر همسات هوم`} />
        <meta name="twitter:description" content={vendorDesc} />
      </Helmet>

      <div className="container">
        {/* Header Section (Reused from VendorProfile.jsx) */}
        <div className="profile-header glass-panel">
          <div className="header-info">
            <div className="avatar-placeholder">
              {brandImage ? (
                <img src={brandImage} alt={vendor.name} />
              ) : (
                <FaStore />
              )}
            </div>
            <div className="text-info">
              <h1>{vendor.name}</h1>
              {vendor.businessField && (
                <span className="badge"><FaBriefcase /> {vendor.businessField}</span>
              )}
              {vendor.vendorDescription && (
                <p className="mt-3" style={{ color: 'var(--text-color, #555)', fontSize: '0.95rem', maxWidth: '800px', lineHeight: '1.6' }}>
                  <FaInfoCircle style={{ color: 'var(--main-color, #ff6f33)', marginLeft: '5px' }} />
                  {vendor.vendorDescription}
                </p>
              )}
            </div>
          </div>
          <div className="header-actions" style={{ display: 'flex', alignItems: 'center' }}>
            <Link
              to={`/vendor/${id}`}
              className="C-btn"
              style={{ padding: '10px 25px', fontSize: '1.1rem', borderRadius: '8px', fontWeight: 'bold' }}
            >
              العودة للملف الشخصي
            </Link>
          </div>
        </div>

        {/* Search Bar */}
        <div className="search-container">
          <div className="vendor-search-bar" onBlur={(e) => {
            // Delay hiding the dropdown so the click event on suggestion can fire
            if (!e.currentTarget.contains(e.relatedTarget)) {
              setTimeout(() => setIsFocused(false), 200);
            }
          }}>
            <input
              type="text"
              placeholder={`ابحث داخل منتجات ${vendor.name}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsFocused(true)}
            />
            <FaSearch className="search-icon" />

            {/* Suggestions Dropdown */}
            {isFocused && searchTerm && (
              <div className="suggestions-dropdown glass-panel">
                {displayProducts.length > 0 ? (
                  displayProducts.slice(0, 5).map((product) => {
                    const subcategory = subcategories.find(sub => sub.id === product.subcategoryId);
                    const subcategoryName = subcategory ? subcategory.name_ar : '';
                    const productLink = `/subcategory/${product.subcategoryId}/${subcategoryName}/product/${product.id}/${product.name_ar}`;

                    return (
                      <Link to={productLink} className="suggestion-item" key={product.id}>
                        <img src={product.image} alt={product.name_ar} />
                        <div className="sugg-info">
                          <span className="sugg-name">{product.name_ar}</span>
                          <span className="sugg-price">{product.salePrice > 0 ? product.salePrice : product.price} EGP</span>
                        </div>
                      </Link>
                    );
                  })
                ) : (
                  <div className="no-sugg">لا توجد منتجات مطابقة لهذا البحث</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Products Grid */}
        <div className="productsContainer">
          {currentItems.length > 0 ? (
            currentItems.map((product) => {
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
            <div className="no-products glass-panel">
              <p>لا توجد منتجات مطابقة لبحثك في هذا المتجر.</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'center' }}>
            <Pagenation
              totalPages={totalPages}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorProducts;
