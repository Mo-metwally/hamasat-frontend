import React, { useState, useEffect } from 'react'
import './ParentPreviow.css'
import { useProducts } from '../../../hooks/useProducts';
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { ThreeDot } from 'react-loading-indicators';

const ParentPreviow = ({ parentId }) => {
    const { products, loading } = useProducts();
    const [showChildren, setShowChildren] = useState(false);
    const [showLoading, setShowLoading] = useState(true);

    // ✅ Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 3; // عدد العناصر في الصفحة

    // ✅ عمل Timeout للـ Loading
    useEffect(() => {
        let timer;

        if (loading || parentId) {
            setShowLoading(true);
            setCurrentPage(1)
        }

        if (!loading) {
            timer = setTimeout(() => {
                setShowLoading(false);
            }, 400);
        }

        return () => clearTimeout(timer);
    }, [loading, parentId]);

    // ✅ دور على المنتج الأب
    const parentProduct = products.find(product => product.id === parentId);

    // ✅ دور على الأبناء
    const childrenProducts = products.filter(product => product.parentId === parentId);

    // ✅ حساب بيانات البيجنيشن
    const totalPages = Math.ceil(childrenProducts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedChildren = [...childrenProducts].reverse().slice(startIndex, startIndex + itemsPerPage);

    if (!parentProduct) {
        return <p>سيتم عرض بيانات المنتج الرئيسي بعد الاختيار</p>;
    }

    if (showLoading) {
        return (
            <div className='previowLoading'>
                <ThreeDot
                    color="#ff6f33"
                    size="medium"
                    text="جاري تحميل بيانات المنتج..."
                    textColor="#ff6f33"
                />
            </div>
        );
    }

    return (
        <div className="p-all-preview">
            <div
                className={`parent-preview clickable ${showChildren ? "active" : "inactive"}`}
                onClick={() => setShowChildren(prev => !prev)}
            >
                <div className='parent-content preview-content'>

                    <div className='preview-content-group'>
                        <p className="title">{parentProduct.name_ar || ""} {!parentProduct.parentId && ('(أساسي)')}</p>
                        <p className="title"> متبقي: <span>{parentProduct.remaining || 0}</span> </p>
                    </div>
                    <br />
                    <div className='preview-content-group'>
                        <p>السعر: <strong>{Number(parentProduct.price || 0).toLocaleString('en-EG')} ج.م</strong></p>
                        {Number(parentProduct.salePrice) > 0 && (
                            <p><strong>سعر بعد الخصم: {Number(parentProduct.salePrice || 0).toLocaleString('en-EG')} ج.م</strong></p>
                        )}
                    </div>
                    <div className='preview-content-group'>
                        <p>اللون: <strong>{parentProduct.color_ar || []}</strong></p>
                        <p>عدد القطع: <strong>{parentProduct.size_ar || []}</strong></p>
                        <p>الحجم: <strong>{parentProduct.size_en || []}</strong></p>
                    </div>
                    <p style={{ margin: "0", fontWeight: "bold" }}>
                        {childrenProducts.length > 0 && (<strong>{showChildren ? (<IoIosArrowUp />) : (<IoIosArrowDown />)}</strong>)}
                        {childrenProducts.length > 0 ? (<small>
                            عدد المنتجات الفرعية: <span>{childrenProducts.length || 0}</span>
                        </small>) : (
                            <small>
                                <span>منتج فرعي </span>
                            </small>
                        )}
                    </p>
                </div>
                <img
                    src={parentProduct.image || ""}
                    alt={parentProduct.name_ar || ""}
                    className="parent-preview-img"
                />
            </div>

            {showChildren && childrenProducts.length > 0 && (
                <div className="children-preview">
                    {paginatedChildren.map(child => (
                        <div key={child.id} className="child-item">
                            <div className='child-content preview-content'>
                                <div className='preview-content-group'>
                                    <p className="title">{child.name_ar || ""}</p>
                                    <p className="title"> متبقي: <span>{child.remaining || 0}</span> </p>
                                </div>
                                <br />
                                <div className='preview-content-group'>
                                    <p>السعر: <strong>{Number(child.price || 0).toLocaleString('en-EG')}</strong> ج.م</p>
                                    {Number(child.salePrice) > 0 && (
                                        <p>سعر بعد الخصم: <strong>{Number(child.salePrice || 0).toLocaleString('en-EG')}</strong> ج.م</p>
                                    )}
                                </div>
                                <div className='preview-content-group'>
                                    <p>اللون: <strong>{child.color_ar || []}</strong></p>
                                    <p>عدد القطع: <strong>{child.size_ar || []}</strong></p>
                                    <p>الحجم: <strong>{child.size_en || []}</strong></p>
                                </div>
                            </div>
                            <img
                                src={child.image || ""}
                                alt={child.name_ar || ""}
                                className="child-preview-img"
                            />
                        </div>
                    ))}

                    {/* ✅ Pagination Controls */}
                    {/* ✅ Pagination Controls (Compact) */}
                    {totalPages > 1 && (
                        <div className="pagination">
                            <div className="pagination-container">
                                <button
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => prev - 1)}
                                >
                                    {"<"}
                                </button>

                                {/* أول صفحة */}
                                <button
                                    onClick={() => setCurrentPage(1)}
                                    className={currentPage === 1 ? "active" : ""}
                                >
                                    1
                                </button>

                                {/* لو الصفحة الحالية أكبر من 3 يظهر .. */}
                                {currentPage > 3 && <span>..</span>}

                                {/* الصفحات حوالين الصفحة الحالية */}
                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                    .filter(page => page >= currentPage - 1 && page <= currentPage + 1 && page !== 1 && page !== totalPages)
                                    .map(page => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={currentPage === page ? "active" : ""}
                                        >
                                            {page}
                                        </button>
                                    ))}

                                {/* لو الصفحة الحالية أبعد من آخر صفحة - 2 يظهر .. */}
                                {currentPage < totalPages - 2 && <span>..</span>}

                                {/* آخر صفحة */}
                                <button
                                    onClick={() => setCurrentPage(totalPages)}
                                    className={currentPage === totalPages ? "active" : ""}
                                >
                                    {totalPages}
                                </button>

                                <button
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(prev => prev + 1)}
                                >
                                    {">"}
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            )}
        </div>
    )
}

export default ParentPreviow;
