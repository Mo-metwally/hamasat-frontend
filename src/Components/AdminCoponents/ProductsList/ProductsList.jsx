import React, { useState } from 'react';
import axios from 'axios';
import './ProductsList.css';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaEdit, FaSortAmountDownAlt, FaSortAmountUpAlt, FaTrash } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import Pagenation from '../../ProductComponents/pagenation/Pagenation';
import { MdAddToPhotos } from "react-icons/md";

import { IoIosArrowForward } from "react-icons/io";
import { IoIosArrowDown } from "react-icons/io";
import { useSubCategories } from '../../../hooks/useCategories';
import { MdSettingsBackupRestore } from "react-icons/md";
import RestockModel from './RestockModel';
import { Switch } from '@mui/material';
import { useProducts } from '../../../hooks/useProducts';
import { useAuth } from '../../../Context/AuthContext';
import { useEffect } from 'react';



const ProductsList = () => {
    const getSavedState = () => {
        try {
            const saved = sessionStorage.getItem('productsListState');
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            return {};
        }
    };
    const savedState = getSavedState();

    const [showWholesale, setShowWholesale] = useState(false);
    // eslint-disable-next-line no-unused-vars
    const [showAdminEdite, setShowAdminEdite] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState(null);
    const [lowStockOnly, setLowStockOnly] = useState(savedState.lowStockOnly || false);
    const [typeSelector, setTypeSelector] = useState(savedState.typeSelector || ''); // إما "category" أو "subcategory"
    const [selectedId, setSelectedId] = useState(savedState.selectedId || '');
    const [restockProduct, setRestockProduct] = useState(null); // المنتج اللي هيتفتح المودال له
    const { products, setProducts, fetchProducts } = useProducts(); // ✅ لازم تسحب الاتنين
    const [searchTerm, setSearchTerm] = useState(savedState.searchTerm || '');
    const [sortOrder, setSortOrder] = useState(savedState.sortOrder || 'desc');
    const [currentPage, setCurrentPage] = useState(savedState.currentPage || 1);
    const [productDetails, setProductDetails] = useState({});
    const [pendingAction, setPendingAction] = useState(null);
    const { user } = useAuth();
    const [vendors, setVendors] = useState([]);
    const [selectedVendorId, setSelectedVendorId] = useState(savedState.selectedVendorId || '');



    useEffect(() => {
        if (user?.role === 'superAdmin') {
            const fetchVendors = async () => {
                try {
                    const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/admin/vendors`, { withCredentials: true });
                    if (res.data.success) {
                        // handlersFactory.getAll returns { data: { results, pagination, data: [...] } }
                        const vendorData = res.data.data.data || res.data.data;
                        setVendors(Array.isArray(vendorData) ? vendorData : []);
                    }
                } catch (err) {
                    console.error("خطأ في جلب البائعين", err);
                }
            };
            fetchVendors();
        }
    }, [user]);

    const location = useLocation();
    const navigate = useNavigate();

    // قراءة قيمة الـ sort من الكويري
    const queryParams = new URLSearchParams(location.search);
    const initialSortKey = queryParams.get('sort') || savedState.sortKey || 'createdAt';

    const [sortKey, setSortKey] = useState(initialSortKey);

    useEffect(() => {
        sessionStorage.setItem('productsListState', JSON.stringify({
            lowStockOnly, typeSelector, selectedId, searchTerm, sortOrder, currentPage, selectedVendorId, sortKey
        }));
    }, [lowStockOnly, typeSelector, selectedId, searchTerm, sortOrder, currentPage, selectedVendorId, sortKey]);


    const {
        categories,
        subcategories,
        categoryOptions,
        subcategoryOptions,
    } = useSubCategories();

    const [expanded, setExpanded] = useState(null);

    const itemsPerPage = 10;

    const getCategoryName = (id) => {
        const cat = categories.find((c) => c.id === id);
        return cat?.name_ar || '—';
    };

    const getSubCategoryName = (id) => {
        const sub = subcategories.find((s) => s.id === id);
        return sub?.name_ar || '—';
    };

    // دالة تجيب تفاصيل المنتج بالـ API
    const fetchProductDetails = async (id) => {
        if (productDetails[id]) return; // لو محملين قبل كده، ما تعملش طلب جديد

        try {
            const res = await axios.get(
                `${process.env.REACT_APP_API_URL}/api/v1/products/${id}`,
                { withCredentials: true }
            );
            // console.log("API RESPONSE", res.data.data);
            setProductDetails(prev => ({
                ...prev,
                [id]: res.data.data, // خزن التفاصيل تحت الـ id
            }));
        } catch (err) {
            console.error("خطأ في جلب تفاصيل المنتج:", err);
        }
    };

    const toggleRow = (id) => {
        if (expanded === id) {
            setExpanded(null);
        } else {
            setExpanded(id);
            fetchProductDetails(id); // جيب التفاصيل أول ما نفتحه
        }
    };

    const handleDelete = async (id) => {

        try {
            await axios.delete(`${process.env.REACT_APP_API_URL}/api/v1/products/${id}`, { withCredentials: true });

            setProducts((prev) => prev.filter((item) => item.id !== id)); // ✅ تعديل هنا

            toast.success('تم حذف المنتج بنجاح.');
        } catch (err) {
            toast.warning('حدث خطأ أثناء حذف المنتج.');
        }
    };

    const filteredData = products
        .filter((item) =>
            (item.name_ar || '').toLowerCase().includes(searchTerm.toLowerCase())
        )
        .filter((item) => {
            if (!selectedId && typeSelector !== "parent") return true;

            if (typeSelector === 'category') {
                return item.categoryId === selectedId;
            } else if (typeSelector === 'subcategory') {
                return item.subcategoryId === selectedId;
            } else if (typeSelector === 'parent') {
                return !item.parentId; // يجيب المنتجات اللي ملهاش parent
            }

            return true;
        })
        .filter((item) => {
            if (selectedVendorId) {
                if (selectedVendorId === 'hamasat') return item.vendorId === null;
                return item.vendorId === selectedVendorId;
            }
            return true;
        })

        .filter((item) => {

            if (sortKey === 'lowStock') {
                return Number(item.remaining) <= 5 && Number(item.remaining) > 0;
            }

            if (sortKey === 'outOfStock') {
                return Number(item.remaining) === 0;
            }

            if (lowStockOnly) {
                return item.remaining <= 5;
            }
            return true;
        });



    const handleSortChange = (e) => {
        const value = e.target.value;
        setSortKey(value);

        // تحديث الكويري في الرابط
        queryParams.set('sort', value);
        navigate({ pathname: location.pathname, search: queryParams.toString() });
    };

    const sortedData = [...filteredData].sort((a, b) => {
        let aValue = a[sortKey];
        let bValue = b[sortKey];

        if (sortKey === 'name_ar') {
            aValue = (aValue || '').toLowerCase();
            bValue = (bValue || '').toLowerCase();
            return sortOrder === 'asc'
                ? aValue.localeCompare(bValue)
                : bValue.localeCompare(aValue);
        }

        if (sortKey === 'createdAt') {
            return sortOrder === 'asc'
                ? new Date(aValue) - new Date(bValue)
                : new Date(bValue) - new Date(aValue);
        }

        if (['discount', 'remaining', 'sold'].includes(sortKey)) {
            return sortOrder === 'asc'
                ? (Number(aValue) || 0) - (Number(bValue) || 0)
                : (Number(bValue) || 0) - (Number(aValue) || 0);
        }

        if (sortKey === 'lowStock') {
            const aLow = (a.remaining <= 5 && a.remaining > 0) ? a.remaining : Infinity;
            const bLow = (b.remaining <= 5 && b.remaining > 0) ? b.remaining : Infinity;

            return sortOrder === 'asc' ? aLow - bLow : bLow - aLow;
        }

        // ✅ منتجات بدون رصيد (remaining = 0 يظهروا الأول)
        if (sortKey === 'outOfStock') {
            const aOut = a.remaining === 0 ? 1 : 0;
            const bOut = b.remaining === 0 ? 1 : 0;
            return sortOrder === 'asc' ? aOut - bOut : bOut - aOut;
        }
        return 0;
    });



    const handleEditClick = (e, item) => {
        e.stopPropagation();
        navigate(`/admin/productslist/edit/${item.id}`);
    };

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = sortedData.slice(startIndex, startIndex + itemsPerPage);

    const reStockProducts = products.filter(product => Number(product.remaining) <= 5);

    return (
        <div className='products-wrapper'>
            <div className="products-container">
                <ToastContainer toastClassName="custom-toast" position="top-right" autoClose={3000} />
                <div className="categories-header">
                    <h2>قائمة المنتجات</h2>
                    <div className='toolbarItm'>
                        <Link className='C-btn' to="/admin/addproducts">+ اضف منتج</Link>
                        <button
                            className='C-btn'
                            onClick={() => {
                                if (showWholesale) {
                                    setShowWholesale(false);
                                    sessionStorage.removeItem("isAuthenticated");
                                } else {
                                    setShowWholesale(true);
                                }
                            }}
                        >
                            {showWholesale ? 'عرض الخصم' : 'عرض الجملة'}
                        </button>
                    </div>
                </div>


                <div className="toolbar">
                    <div className='toolbarItm'>
                        <div className="sort-icons">
                            <FaSortAmountDownAlt
                                title="ترتيب تنازلي"
                                className={`sort-icon ${sortOrder === 'desc' ? 'active' : ''}`}
                                onClick={() => setSortOrder('desc')}
                            />
                            <FaSortAmountUpAlt
                                title="ترتيب تصاعدي"
                                className={`sort-icon ${sortOrder === 'asc' ? 'active' : ''}`}
                                onClick={() => setSortOrder('asc')}
                            />
                        </div>
                        <div>
                            <select className="selector" value={sortKey} onChange={handleSortChange}>
                                <option value="createdAt">وقت الإضافة</option>
                                <option value="name_ar">الاسم</option>
                                <option value="discount">الخصم</option>
                                <option value="remaining">المتبقي</option>
                                <option value="sold">المبيعات</option>
                                <option value="lowStock">منتجات برصيد منخفض</option>
                                <option value="outOfStock">منتجات بدون رصيد</option>
                            </select>
                        </div>

                    </div>

                    <div className='toolbarItm'>
                        <select
                            className="selector"
                            value={typeSelector}
                            onChange={(e) => {
                                setTypeSelector(e.target.value);
                                setSelectedId(''); // نفضي الاختيار التاني لو النوع اتغير
                            }}
                        >
                            <option value="">الكل</option>
                            <option value="category">فئة رئيسية</option>
                            <option value="subcategory">فئة فرعية</option>
                            <option value="parent">منتجات رئيسية</option>
                        </select>

                        {typeSelector && typeSelector !== "parent" && (   // ✅ خليه يختفي لو Parent
                            <select
                                className="selector"
                                value={selectedId}
                                onChange={(e) => setSelectedId(e.target.value)}
                            >
                                <option value="">
                                    اختر {typeSelector === 'category' ? 'فئة رئيسية' : 'فئة فرعية'}
                                </option>
                                {(typeSelector === 'category' ? categoryOptions : subcategoryOptions).map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        )}

                    </div>
                    <div className='toolbarItm lowStock'>
                        <div className='check_sec'>
                            <Switch color="warning"
                                checked={lowStockOnly}
                                onChange={(e) => setLowStockOnly(e.target.checked)} />
                            <p> مخزون قليل: <strong> {reStockProducts.length}</strong> منتج</p>
                        </div>
                    </div>
                    {user?.role === 'superAdmin' && (
                        <div className='toolbarItm'>
                            <select
                                className="selector"
                                value={selectedVendorId}
                                onChange={(e) => setSelectedVendorId(e.target.value)}
                            >
                                <option value="">كل البائعين</option>
                                <option value="hamasat">منصة همسات</option>
                                {Array.isArray(vendors) && vendors.map(v => (
                                    <option key={v.id} value={v.id}>{v.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    <input
                        type="text"
                        placeholder="بحث..."
                        className="search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="table-wrapper">
                    <table className="categories-table">
                        <thead>
                            <tr>
                                <th>أدوات</th>
                                <th>الفئة الرئيسية</th>
                                <th>الفئة الفرعية</th>
                                <th>السعر</th>
                                <th>{showWholesale ? "سعر الجملة" : "سعر الخصم"}</th>
                                <th>المبيعات</th>
                                <th>المتبقي</th>
                                <th>الاسم</th>
                                <th>الصورة</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.map((item) => (
                                <React.Fragment key={item.id}>
                                    <tr className={`table-row ${expanded === item.id ? 'expanded' : ''}`} onClick={() => toggleRow(item.id)}>
                                        <td>
                                            <div className="action-icons" onClick={(e) => e.stopPropagation()}>
                                                {expanded === item.id ? <IoIosArrowDown /> : <IoIosArrowForward />}
                                                <FaTrash
                                                    className='del'
                                                    title="حذف المنتج"
                                                    onClick={() => {
                                                        const confirmDelete = window.confirm("هل أنت متأكد أنك تريد حذف هذا المنتج؟");
                                                        if (confirmDelete) handleDelete(item.id);
                                                    }}
                                                />

                                                <FaEdit
                                                    className="edt"
                                                    title="تعديل المنتج"
                                                    onClick={(e) => handleEditClick(e, item)}
                                                    style={{ cursor: "pointer" }}
                                                />

                                                <MdAddToPhotos
                                                    className={`${item.parentId ? "noDupl" : ""}`}
                                                    title="اضافة منتج فرعي"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate("/admin/duplicateproduct", {
                                                            state: {
                                                                productId: item.id,
                                                                categoryId: item.categoryId,
                                                                brandId: item.brandId,
                                                                subcategoryId: item.subcategoryId,
                                                            },
                                                        });
                                                    }}
                                                />


                                            </div>
                                        </td>
                                        <td>
                                            <p><strong>{getCategoryName(item.categoryId)}</strong></p>
                                        </td>
                                        <td>
                                            <p><strong>{getSubCategoryName(item.subcategoryId)}</strong></p>
                                        </td>

                                        <td>
                                            <p>
                                                <strong>{Number(item.price || 0).toLocaleString('en-EG')}</strong>
                                            </p>

                                        </td>
                                        <td>
                                            <p>
                                                <strong>
                                                    {Math.floor(Number(showWholesale ? item.basePrice : item.salePrice || 0)).toLocaleString('en-EG')}
                                                </strong>
                                            </p>

                                            {/* <p><strong>{Math.floor(item.basePrice * item.stock)}</strong></p> */}

                                        </td>
                                        <td>{item.sold}</td>
                                        <td className='stockRow'>
                                            <div className="stock-content">
                                                {item.remaining}
                                                {item.remaining <= 5 && (
                                                    <button
                                                        className='restockIcon'
                                                        title='إضافة كمية'
                                                        onClick={(e) => {
                                                            e.stopPropagation(); // لمنع toggle الصف
                                                            setRestockProduct(item.id); // تعيين المنتج اللي هيتعامل معه المودال
                                                        }}
                                                    >
                                                        <span><MdSettingsBackupRestore /></span>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                        <td className='produvt-table-name'>
                                            <p><strong>{item.name_ar}</strong></p>
                                        </td>
                                        <td>
                                            <img src={item.image} alt={item.name_ar} style={{ width: '60px', borderRadius: '6px' }} />
                                        </td>
                                    </tr>
                                    {expanded === item.id && (
                                        <tr className="table-details" dir="rtl">
                                            <td colSpan="9">
                                                <div className="details-content">
                                                    <div className='detail-content'>
                                                        <div className='children-products'>
                                                            <p>
                                                                <strong>
                                                                    عدد المنتجات الفرعية: {productDetails[item.id]?.children?.length ?? 0}
                                                                </strong>
                                                            </p>

                                                            <ul>
                                                                {productDetails[item.id]?.children?.map((child) => (
                                                                    <li key={child.id}>{child.name_ar}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                        <p><strong>المنشأ/الخامة:</strong> {item.model_en || '—'}</p>
                                                        <p><strong>البراند:</strong> {item.model_ar || '—'}</p>
                                                        {user?.role === 'superAdmin' && (
                                                            <p><strong>البائع:</strong> {item.vendor ? item.vendor.name : 'منصة همسات هوم'}</p>
                                                        )}
                                                        <p>
                                                            <strong>السعر:</strong> {item.price ? Number(item.price).toLocaleString('en-EG') : '—'}
                                                        </p>

                                                        <p><strong>الخصم:</strong> {item.discount || '—'} %</p>
                                                        <p><strong>عدد المبيعات:</strong> {item.sold}</p>
                                                        <p><strong>المخزون:</strong> {item.stock}</p>
                                                    </div>
                                                    <div className='detail-content'>
                                                        <p><strong>الألوان: </strong> {item.color_ar?.join(', ') || '—'}</p>
                                                        <p><strong>الحجم: </strong> {item.size_en?.join(', ') || '—'}</p>
                                                        <p><strong>عدد القطع: </strong> {item.size_ar?.join(', ') || '—'}</p>

                                                        <p><strong>اسم البندل: </strong> {item.keywords || 'لايوجد'} </p>
                                                        <p><strong>الوصف قصير: </strong> {item.slug} </p>
                                                        <p><strong>الوصف:</strong></p>
                                                        <div dangerouslySetInnerHTML={{ __html: item.description_ar || '<p>لا يوجد وصف</p>' }} />
                                                    </div>
                                                    <div className='detail-content'>
                                                        <p><strong>الصور الإضافية:</strong></p>
                                                        <div className="product-images" >
                                                            {item.images?.map((img, idx) => (
                                                                <img
                                                                    key={idx}
                                                                    src={img}
                                                                    alt={`img-${idx}`}
                                                                    style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '6px' }}
                                                                />
                                                            ))}
                                                        </div>
                                                        <br />
                                                        <p><strong>جديد؟</strong> {item.isNew ? '✅ نعم' : '❌ لا'}</p>
                                                        {item.isNew && item.newExpireDate && (
                                                            <p><strong>تاريخ انتهاء الجديد:</strong> {new Date(item.newExpireDate).toLocaleDateString()}</p>
                                                        )}

                                                        <p><strong>يوجد خصم؟</strong> {item.isSale ? '✅ نعم' : '❌ لا'}</p>
                                                        <p>
                                                            <strong>سعر بعد الخصم: </strong>
                                                            {Number(item.salePrice) > 0
                                                                ? Number(item.salePrice).toLocaleString('en-EG')
                                                                : Number(item.price).toLocaleString('en-EG')}
                                                        </p>


                                                        {item.isSale && item.saleExpireDate && (
                                                            <p><strong>تاريخ انتهاء الخصم:</strong> {new Date(item.saleExpireDate).toLocaleDateString()}</p>
                                                        )}
                                                        <p><strong>تاريخ الإنشاء:</strong> {new Date(item.createdAt).toLocaleString()}</p>
                                                        <p><strong>تاريخ التحديث:</strong> {new Date(item.updatedAt).toLocaleString()}</p>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}

                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>

                <Pagenation totalPages={totalPages} currentPage={currentPage} onPageChange={setCurrentPage} />
            </div>

            {restockProduct && (
                <RestockModel
                    itemId={restockProduct}
                    onClose={() => setRestockProduct(null)}
                    onUpdate={(id, newStock) => {
                        setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: newStock } : p));
                        fetchProducts();
                    }}
                />
            )}
        </div>
    );
};

export default ProductsList;
