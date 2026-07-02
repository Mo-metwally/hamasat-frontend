import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './CategoriesList.css';
import { Link } from 'react-router-dom';
import { MdOutlineSaveAs } from "react-icons/md";
import { TbCancel } from "react-icons/tb";
import { FaEdit, FaSortAmountDownAlt, FaSortAmountUpAlt, FaTrash } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import Pagenation from '../../ProductComponents/pagenation/Pagenation';
import { useProducts } from '../../../hooks/useProducts';
import { useAuth } from '../../../Context/AuthContext';

const CategoriesList = () => {
    const { products } = useProducts();
    const { user } = useAuth();
    const [sortKey, setSortKey] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');
    const [editedImage, setEditedImage] = useState(null);

    const [data, setData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [dataSource, setDataSource] = useState('categories');
    const [currentPage, setCurrentPage] = useState(1);
    const [editingId, setEditingId] = useState(null);
    const [editedName, setEditedName] = useState('');

    const itemsPerPage = 10;

    const API_MAP = {
        categories: `${process.env.REACT_APP_API_URL}/api/v1/categories`,
        subcategories: `${process.env.REACT_APP_API_URL}/api/v1/subcategories`,
        brands: `${process.env.REACT_APP_API_URL}/api/v1/brands`,
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(API_MAP[dataSource]);
                const list = Array.isArray(res.data?.data?.data) ? res.data.data.data : [];
                setData(list);
                setCurrentPage(1);
            } catch (error) {
                console.error('Fetch error:', error);
                setData([]);
            }
        };
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dataSource]);

    const filteredData = data.filter((item) =>
        (item.name || item.name_ar || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getProductCount = (id) => {
        if (!products) return 0;

        if (dataSource === 'subcategories') {
            return products.filter((p) => p.subcategoryId === id).length;
        }

        if (dataSource === 'categories') {
            return products.filter((p) => p.categoryId === id).length;
        }

        if (dataSource === 'brands') {
            return products.filter((p) => p.brandId === id).length;
        }

        return 0;
    };

    // ترتيب حسب مفتاح معين
    const sortedData = [...filteredData].sort((a, b) => {
        let aValue = a[sortKey];
        let bValue = b[sortKey];

        // ترتيب حسب الاسم
        if (sortKey === 'name_ar' || sortKey === 'name') {
            aValue = (aValue || '').toLowerCase();
            bValue = (bValue || '').toLowerCase();
            return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }

        // ترتيب حسب عدد المنتجات
        if (sortKey === 'productCount') {
            const aCount = getProductCount(a.id);
            const bCount = getProductCount(b.id);
            return sortOrder === 'asc' ? aCount - bCount : bCount - aCount;
        }

        // ترتيب حسب تاريخ الإضافة
        return sortOrder === 'asc'
            ? new Date(aValue) - new Date(bValue)
            : new Date(bValue) - new Date(aValue);
    });


    const handleEdit = (id, currentName, currentImage) => {
        setEditingId(id);
        setEditedName(currentName || "");
        setEditedImage(currentImage || null);
    };


    const handleSave = async (id) => {
        if (!editedName.trim()) return;

        let url = "";
        if (dataSource === "categories") url = `${API_MAP.categories}/${id}`;
        if (dataSource === "subcategories") url = `${API_MAP.subcategories}/${id}`;
        if (dataSource === "brands") url = `${API_MAP.brands}/${id}`;

        try {
            const formData = new FormData();
            formData.append("name_ar", editedName);
            if (editedImage instanceof File) {
                formData.append("image", editedImage);
            }

            await axios.put(url, formData, {
                withCredentials: true,
                headers: { "Content-Type": "multipart/form-data" },
            });

            setData((prev) =>
                prev.map((item) =>
                    item.id === id
                        ? {
                            ...item,
                            name_ar: editedName,
                            image: editedImage instanceof File
                                ? URL.createObjectURL(editedImage) // preview مؤقت
                                : editedImage,
                        }
                        : item
                )
            );

            toast.success("تم تعديل البيانات بنجاح.");
        } catch (error) {
            console.error(error);
            toast.error("❌ حدث خطأ أثناء التعديل.");
        } finally {
            setEditingId(null);
            setEditedName("");
            setEditedImage(null);
        }
    };



    const handleDelete = async (id) => {
        const confirmDelete = window.confirm('هل أنت متأكد أنك تريد حذف هذا العنصر؟ سيتم حذف جميع المنتجات المرتبطة به أيضاً ولن يمكنك استرجاعها!');
        if (!confirmDelete) return;

        let url = '';
        if (dataSource === 'categories') url = `${API_MAP.categories}/${id}`;
        if (dataSource === 'subcategories') url = `${API_MAP.subcategories}/${id}`;
        if (dataSource === 'brands') url = `${API_MAP.brands}/${id}`;

        try {
            await axios.delete(url, { withCredentials: true });
            setData((prev) => prev.filter((item) => item.id !== id));
            toast.success('تم حذف العنصر بنجاح.');
        } catch (err) {
            toast.warning('حدث خطأ أثناء حذف العنصر. حاول مرة أخرى.');
        }
    };




    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = sortedData.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="categories-container">
            <ToastContainer toastClassName="custom-toast" position="top-right" autoClose={3000} />
            <div className="categories-header">
                <h2>
                    {dataSource === 'categories' ? 'فئات رئيسية' :
                        dataSource === 'subcategories' ? 'فئات فرعية' : 'البائعين'}
                </h2>
                <Link className='C-btn' to="/admin/addcategories">+ اضف فئة</Link>
            </div>

            <div className="toolbar">
                <div className="radio-group-modern">
                    <label className={`radio-label ${dataSource === 'categories' ? 'active' : ''}`}>
                        <input
                            type="radio"
                            name="dataSource"
                            value="categories"
                            checked={dataSource === 'categories'}
                            onChange={(e) => setDataSource(e.target.value)}
                        />
                        فئات رئيسية
                    </label>
                    <label className={`radio-label ${dataSource === 'subcategories' ? 'active' : ''}`}>
                        <input
                            type="radio"
                            name="dataSource"
                            value="subcategories"
                            checked={dataSource === 'subcategories'}
                            onChange={(e) => setDataSource(e.target.value)}
                        />
                        فئات فرعية
                    </label>
                    <label className={`radio-label ${dataSource === 'brands' ? 'active' : ''}`}>
                        <input
                            type="radio"
                            name="dataSource"
                            value="brands"
                            checked={dataSource === 'brands'}
                            onChange={(e) => setDataSource(e.target.value)}
                        />
                        البائعين
                    </label>
                </div>

                <div className="sort-icons">
                    <FaSortAmountUpAlt
                        title="ترتيب تصاعدي"
                        className={`sort-icon ${sortOrder === 'asc' ? 'active' : ''}`}
                        onClick={() => setSortOrder('asc')}
                    />
                    <FaSortAmountDownAlt
                        title="ترتيب تنازلي"
                        className={`sort-icon ${sortOrder === 'desc' ? 'active' : ''}`}
                        onClick={() => setSortOrder('desc')}
                    />
                </div>


                <select
                    className="selector"
                    value={sortKey}
                    onChange={(e) => setSortKey(e.target.value)}
                >
                    <option value="createdAt">وقت الإضافة</option>
                    <option value="name_ar">الاسم</option>
                    <option value="productCount">عدد المنتجات</option>
                </select>

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
                            <th>الأدوات</th>
                            <th>بواسطة</th>
                            <th>عدد المنتجات</th>
                            <th>الأسم</th>
                            <th>الصورة</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.map((item) => (
                            <React.Fragment key={item.id}>
                                <tr className="table-row" >
                                    <td>
                                        <div
                                            className="action-icons"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {(user?.role === 'superAdmin' || (dataSource === 'subcategories' && user?.role === 'admin' && item.vendorId === user?.id)) && (
                                                <>
                                                    <FaTrash
                                                        className='del'
                                                        title="حذف"
                                                        onClick={() => handleDelete(item.id)}
                                                    />
                                                    {editingId === item.id ? (
                                                        <>
                                                            <MdOutlineSaveAs
                                                                className="save-btn"
                                                                title="حفظ"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleSave(item.id);
                                                                }}
                                                            />

                                                            <TbCancel
                                                                className="cancel-btn"
                                                                title="إلغاء"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setEditingId(null);
                                                                    setEditedName('');
                                                                }}
                                                            />
                                                        </>
                                                    ) : (
                                                        <FaEdit
                                                            className='edt'
                                                            title="تعديل"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleEdit(item.id, item.name_ar);
                                                            }}
                                                        />
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        {item.vendor?.name ? (
                                            <span className="creator-badge vendor">البائع: {item.vendor.name}</span>
                                        ) : (
                                            <span className="creator-badge admin">الإدارة</span>
                                        )}
                                    </td>
                                    <td>{getProductCount(item.id)} منتج </td>
                                    <td className="expand-cell">
                                        {editingId === item.id ? (
                                            <input
                                                type="text"
                                                value={editedName}
                                                onChange={(e) => setEditedName(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleSave(item.id);
                                                }}

                                                autoFocus
                                            />
                                        ) : (
                                            <span>{item.name_ar || item.name || 'Unnamed'}</span>
                                        )}
                                    </td>
                                    <td>
                                        {editingId === item.id ? (
                                            <>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => setEditedImage(e.target.files[0])}

                                                />
                                                {editedImage ? (
                                                    <img
                                                        src={
                                                            editedImage instanceof File
                                                                ? URL.createObjectURL(editedImage)
                                                                : editedImage
                                                        }
                                                        alt="preview"
                                                        style={{ width: "60px", borderRadius: "6px", marginTop: "5px" }}
                                                    />
                                                ) : (
                                                    <img
                                                        src={item.image || "https://via.placeholder.com/60"}
                                                        alt={item.name}
                                                        style={{ width: "60px", borderRadius: "6px", marginTop: "5px" }}
                                                    />
                                                )}
                                            </>
                                        ) : (
                                            <img
                                                src={item.image || "https://via.placeholder.com/60"}
                                                alt={item.name}
                                                style={{ width: "60px", borderRadius: "6px" }}
                                            />
                                        )}
                                    </td>
                                </tr>
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
            <Pagenation totalPages={totalPages} currentPage={currentPage} onPageChange={setCurrentPage} />
        </div>
    );
};

export default CategoriesList;
