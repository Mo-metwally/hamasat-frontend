import React, { useState } from 'react';
import './SideBarFilter.scss';
import SliderBar from './SliderBar';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useSubCategories } from '../../../hooks/useCategories';
import { useFilter } from '../../../Context/FilterContext';

const SideBarFilter = ({ priceRange, setPriceRange, maxPrice, products, setFilteredProductsm }) => {
    const { filterShow, filterRef } = useFilter();
    const { subCatId } = useParams();
    const location = useLocation();
    const { subcategories, loading, error } = useSubCategories();

    // حالات منفصلة للفلترة
    const [selectedMaterial, setSelectedMaterial] = useState('');
    const [selectedBrand, setSelectedBrand] = useState('');

    const staticPages = [
        { id: 1, name_ar: "المتجر", url: "/shop" },
        { id: 2, name_ar: "وصل حديثاً", url: "/newarrival" },
        { id: 3, name_ar: "عروض خاصة", url: "/offers" },
        { id: 4, name_ar: "الأكثر مبيعاً", url: "/bestselling" },
        { id: 5, name_ar: "رأيت مؤخراً", url: "/suggestion" },
    ];

    const isStaticPage = staticPages.some(page => page.url === location.pathname);
    const validProducts = Array.isArray(products) ? products : [];

    // تحديد الفئة الفرعية الحالية
    const selectedSubCategory = subcategories.find(subcategory => subcategory.id === subCatId);
    const categoryId = selectedSubCategory ? selectedSubCategory.categoryId : null;
    const relatedSubcategories = subcategories.filter(subcategory => subcategory.categoryId === categoryId);

    // استخراج القيم الفريدة
    const uniqueMaterials = validProducts.length > 0 ? [...new Set(validProducts.map(p => p.model_ar))] : [];
    const uniqueBrands = validProducts.length > 0 ? [...new Set(validProducts.map(p => p.model_en))] : [];

    // فلترة حسب المنشأ/الخامة
    const handleMaterialClick = (material) => {
        setSelectedMaterial(material);
        let filtered = material ? validProducts.filter(p => p.model_ar === material) : validProducts;
        setFilteredProductsm(filtered);
    };

    // فلترة حسب البراند
    const handleBrandClick = (brand) => {
        setSelectedBrand(brand);
        let filtered = brand ? validProducts.filter(p => p.model_en === brand) : validProducts;
        setFilteredProductsm(filtered);
    };

    return (
        <>
            <div className={`isMobileFilter ${filterShow ? "isMobileFilter-Show" : ""}`}></div>
            <div ref={filterRef} id="sidebarFilter" className={filterShow ? "filterShow" : ""}>
                <div className='sidebarFilter'>
                    {/* شريط الأسعار */}
                    <SliderBar priceRange={priceRange} setPriceRange={setPriceRange} maxPrice={maxPrice} />
                    <br />

                    {/* روابط سريعة */}
                    {isStaticPage && (
                        <div className='sideCat'>
                            <p><strong>روابط سريعة</strong></p>
                            {loading && <p>تحميل الفئات....</p>}
                            {error && <p>خطأ تحميل الفئات: {error}</p>}
                            <ul>
                                {staticPages.map(page => (
                                    <li
                                        key={page.id}
                                        style={{ fontWeight: location.pathname === page.url ? 'bold' : 'normal' }}
                                    >
                                        <Link to={page.url}>{page.name_ar}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* فئات ذات صلة */}
                    <div className='sideCat'>
                        <p><strong>{relatedSubcategories.length > 0 ? "فئات ذات صلة" : "جميع الفئات"}</strong></p>
                        {loading && <p>تحميل الفئات....</p>}
                        {error && <p>خطأ تحميل الفئات: {error}</p>}
                        <ul>
                            {(relatedSubcategories.length > 0 ? relatedSubcategories : subcategories).map(subcat => (
                                <li key={subcat.id} style={{ fontWeight: subCatId === subcat.id ? 'bold' : 'normal' }}>
                                    <Link to={`/subcategory/${subcat.id}/${subcat.name_ar}`}>
                                        {subcat.name_ar}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* فلتر المنشأ / الخامة */}
                    <div className='model-filter sideCat'>

                        <p><strong>تصفية حسب البراند</strong></p>
                        <ul>
                            <li
                                style={{ fontWeight: selectedMaterial === '' ? 'bold' : 'normal', cursor: 'pointer' }}
                                onClick={() => handleMaterialClick('')}
                            >

                                جميع البراندات
                            </li>
                            {uniqueMaterials.length === 0 ? (
                                <li>لا توجد براندات</li>

                            ) : (
                                uniqueMaterials.map(material => (
                                    <li
                                        key={material}
                                        style={{ fontWeight: selectedMaterial === material ? 'bold' : 'normal', cursor: 'pointer' }}
                                        onClick={() => handleMaterialClick(material)}
                                    >
                                        {material}
                                    </li>
                                ))
                            )}
                        </ul>
                    </div>

                    {/* فلتر البراند */}
                    <div className='model-filter sideCat'>
                        <p><strong>المنشأ / الخامة</strong></p>
                        <ul>
                            <li
                                style={{ fontWeight: selectedBrand === '' ? 'bold' : 'normal', cursor: 'pointer' }}
                                onClick={() => handleBrandClick('')}
                            >
                                كل المنتجات
                            </li>
                            {uniqueBrands.length === 0 ? (
                                <li>لا توجد خامات</li>

                            ) : (
                                uniqueBrands.map(brand => (
                                    <li
                                        key={brand}
                                        style={{ fontWeight: selectedBrand === brand ? 'bold' : 'normal', cursor: 'pointer' }}
                                        onClick={() => handleBrandClick(brand)}
                                    >
                                        {brand}
                                    </li>
                                ))
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SideBarFilter;
