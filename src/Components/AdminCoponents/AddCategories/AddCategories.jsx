import React, { useState, useEffect } from 'react';
import './AddCategories.css';
import { AiOutlineCloudUpload } from "react-icons/ai";
import { FaStarOfLife } from 'react-icons/fa';
import { LuReplace } from "react-icons/lu";
import { Link } from 'react-router-dom';
import { Link as LinkS } from 'react-scroll';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../Context/AuthContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { useSubCategories } from '../../../hooks/useCategories';
import { ThreeDot } from 'react-loading-indicators';



const AddSubCategories = () => {
    const { fetchCategories, fetchSubcategories, categories } = useSubCategories();
    const [checkLoading, setCheckLoading] = useState(false);
    const [nameAr, setNameAr] = useState('');
    const [subimageFile, setSubImageFile] = useState(null);
    const [subimagePreview, setSubImagePreview] = useState(null);
    const [categoryId, setCategoryId] = useState('');
    // eslint-disable-next-line no-unused-vars
    const [categoryName, setCategoryName] = useState('');
    const [errors, setErrors] = useState({});
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        if (categories.length === 0) {
            fetchCategories();
        }
    }, [categories, fetchCategories]);

    const handleSubCategoryImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSubImageFile(file);
            setSubImagePreview(URL.createObjectURL(file));
            setErrors((prev) => ({ ...prev, image: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitted(true);
        setCheckLoading(true);
        const newErrors = {};
        if (!nameAr.trim()) newErrors.name_ar = 'الرجاء إدخال اسم الفئة.';
        if (!subimageFile) newErrors.image = 'الرجاء اختيار صورة.';
        if (!categoryId) newErrors.category_id = 'الرجاء اختيار الفئة الرئيسية.';

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            toast.warning('يرجى ملء جميع الحقول المطلوبة');
            setCheckLoading(false);

            return;
        }

        const formData = new FormData();
        formData.append('name_ar', nameAr);
        formData.append('image', subimageFile);
        formData.append('categoryId', categoryId);

        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/api/v1/subcategories`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true,
            });

            toast.success('تمت الإضافة بنجاح');
            setNameAr('');
            setSubImageFile(null);
            setSubImagePreview(null);
            setCategoryId('');
            setErrors({});
            setSubmitted(false);
            setCheckLoading(false);

            fetchSubcategories();

        } catch (error) {
            console.error('Error uploading Subcategory:', error);
            setCheckLoading(false);

            if (
                error.response &&
                error.response.data &&
                error.response.data.message === "Record with this name already exists in one of the languages"
            ) {
                toast.error('الاسم مستخدم بالفعل');
                setErrors({ name_ar: 'الاسم مستخدم بالفعل' });
                setCheckLoading(false);

            } else {
                toast.error('حدث خطأ أثناء الإضافة');
                setErrors({ image: 'برجاء تحويل الصور الي صيغة (.png, .jpg, .webp)' });
                setCheckLoading(false);

            }
        }
    };


    const customStyles = {
        menuPortal: base => ({ ...base, zIndex: 9999 }),
        control: (provided, state) => ({
            ...provided,
            backgroundColor: 'var(--admin-card-bg, #ffffff)',
            borderColor: state.isFocused ? 'var(--main-color, #ff6f33)' : 'var(--admin-border-light, #e2e8f0)',
            boxShadow: state.isFocused ? '0 0 0 4px rgba(255, 111, 51, 0.15)' : 'none',
            borderRadius: '12px',
            padding: '4px',
            color: 'var(--admin-text-main, #1e293b)',
            minHeight: '50px',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            '&:hover': {
                borderColor: 'var(--main-color, #ff6f33)'
            }
        }),
        menu: (provided) => ({
            ...provided,
            backgroundColor: 'var(--admin-card-bg, #ffffff)',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            border: '1px solid var(--admin-border-light, #e2e8f0)',
            overflow: 'hidden',
            zIndex: 100,
            direction: 'rtl'
        }),
        menuList: (provided) => ({
            ...provided,
            padding: 0
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected
                ? 'var(--main-color, #ff6f33)'
                : state.isFocused
                    ? 'rgba(255, 111, 51, 0.1)'
                    : 'transparent',
            color: state.isSelected
                ? '#fff'
                : 'var(--admin-text-main, #1e293b)',
            cursor: 'pointer',
            padding: '12px 18px',
            transition: 'all 0.2s ease',
            '&:active': {
                backgroundColor: 'var(--main-color, #ff6f33)',
            }
        }),
        singleValue: (provided) => ({
            ...provided,
            color: 'var(--admin-text-main, #1e293b)'
        }),
        input: (provided) => ({
            ...provided,
            color: 'var(--admin-text-main, #1e293b)'
        }),
        placeholder: (provided) => ({
            ...provided,
            color: 'var(--admin-text-muted, #64748b)'
        }),
        noOptionsMessage: (base) => ({
            ...base,
            color: 'red',
            textAlign: 'right',
        }),
    };

    const categoryOptions = categories.map(cat => ({
        label: cat.name_ar,
        value: cat.id,
    }));

    return (
        <div className='product-card' id='addSubCat'>
            <h5><span>2</span> إضافة فئة فرعية</h5>
            <form onSubmit={handleSubmit}>
                <div className='addProducts-Org'>
                    <div className='addProducts-Org-section' style={{ flex: 1 }}>
                        <div className='lable-col'>
                            <label>
                                اسم الفئة الفرعية <span className='star'><FaStarOfLife size={8} /></span>
                            </label>
                            <input
                                type="text"
                                placeholder="أدخل اسم الفئة الفرعية"
                                value={nameAr}
                                onChange={(e) => {
                                    setNameAr(e.target.value);
                                    setErrors((prev) => ({ ...prev, name_ar: '' }));
                                }}
                                className={submitted && errors.name_ar ? 'input-error' : ''}
                            />
                            {errors.name_ar && <small className="error-message">* {errors.name_ar}</small>}
                        </div>

                        <div className='lable-col' style={{ marginTop: '15px' }}>
                            <label>
                                اختر الفئة الرئيسية <span className='star'><FaStarOfLife size={8} /></span>
                            </label>
                            <Select className='selector'
                                options={categoryOptions}
                                value={categoryOptions.find(option => option.value === categoryId)}
                                onChange={(selectedOption) => {
                                    if (selectedOption) {
                                        setCategoryId(selectedOption.value);
                                        setCategoryName(selectedOption.label);
                                        setErrors((prev) => ({ ...prev, category_id: '' }));
                                    } else {
                                        setCategoryId('');
                                        setCategoryName('');
                                    }
                                }}
                                placeholder="اختر فئة..."
                                noOptionsMessage={() => 'لا يوجد نتائج'}
                                isClearable
                                isSearchable
                                menuPortalTarget={document.body}
                                styles={customStyles}
                            />
                            {errors.category_id && <small className="error-message">* {errors.category_id}</small>}
                        </div>
                    </div>

                    <div className="addImg" style={{ flex: 1 }}>
                        <label htmlFor="subCatImg" className="uploadBox">
                            {subimagePreview ? (
                                <>
                                    <span className="text">تغير الصورة</span>
                                    <span className="plus"><LuReplace /></span>
                                </>
                            ) : (
                                <>
                                    <span className="plus"><AiOutlineCloudUpload /></span>
                                    <span className="text">اختر صورة</span>
                                </>
                            )}
                            <input
                                type="file"
                                id="subCatImg"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={handleSubCategoryImageChange}
                            />
                        </label>
                        {errors.image && <p className="error-message">* {errors.image}</p>}
                        {subimagePreview && (
                            <div className="imgBox">
                                <img src={subimagePreview} alt="Selected" />
                            </div>
                        )}
                    </div>
                </div>

                <div className='admin-btn-container' style={{ marginTop: '20px' }}>
                    {checkLoading ? (
                        <ThreeDot color="#ff6f33" size="small" text="جاري الحفظ..." textColor="#ff6f33" />
                    ) : (
                        <button type="submit" className='C-btn'>حفظ الفئة الفرعية</button>
                    )}
                </div>
            </form>
        </div>
    );
};


const AddBrand = () => {
    const { fetchBrands } = useSubCategories();
    const [checkLoading, setCheckLoading] = useState(false);
    const [nameAr, setNameAr] = useState('');
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/users`, { withCredentials: true });
                const dataObj = res.data?.data;
                const usersArray = Array.isArray(dataObj) ? dataObj : dataObj?.data || [];
                setUsers(usersArray);
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };
        fetchUsers();
    }, []);
    const [brandimageFile, setBrandImageFile] = useState(null);
    const [brandimagePreview, setBrandImagePreview] = useState(null);
    const [errors, setErrors] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const { isAuthenticated, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            navigate('/login');
        }
    }, [loading, isAuthenticated, navigate]);

    if (loading) {
        return (
            <div className='loading'>
                <ThreeDot color="#ff6f33" size="medium" text="جاري التحقق من الصلاحيات..." textColor="#ff6f33" />
            </div>
        )
    };


    const customStyles = {
        menuPortal: base => ({ ...base, zIndex: 9999 }),
        control: (provided, state) => ({
            ...provided,
            backgroundColor: 'var(--admin-card-bg, #ffffff)',
            borderColor: state.isFocused ? 'var(--main-color, #ff6f33)' : 'var(--admin-border-light, #e2e8f0)',
            boxShadow: state.isFocused ? '0 0 0 4px rgba(255, 111, 51, 0.15)' : 'none',
            borderRadius: '12px',
            padding: '4px',
            color: 'var(--admin-text-main, #1e293b)',
            minHeight: '50px',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            '&:hover': { borderColor: 'var(--main-color, #ff6f33)' }
        }),
        menu: (provided) => ({
            ...provided,
            backgroundColor: 'var(--admin-card-bg, #ffffff)',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            border: '1px solid var(--admin-border-light, #e2e8f0)',
            overflow: 'hidden',
            zIndex: 100,
            direction: 'rtl'
        }),
        menuList: (provided) => ({ ...provided, padding: 0 }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected ? 'var(--main-color, #ff6f33)' : state.isFocused ? 'rgba(255, 111, 51, 0.1)' : 'transparent',
            color: state.isSelected ? '#fff' : 'var(--admin-text-main, #1e293b)',
            cursor: 'pointer',
            padding: '12px 18px',
            transition: 'all 0.2s ease',
            '&:active': { backgroundColor: 'var(--main-color, #ff6f33)' }
        }),
        singleValue: (provided) => ({ ...provided, color: 'var(--admin-text-main, #1e293b)' }),
        input: (provided) => ({ ...provided, color: 'var(--admin-text-main, #1e293b)' }),
        placeholder: (provided) => ({ ...provided, color: 'var(--admin-text-muted, #64748b)' }),
        noOptionsMessage: (base) => ({ ...base, color: 'red', textAlign: 'right' })
    };

    const userOptions = users.map(u => ({ label: u.name, value: u.name }));

    const handleBrandImageSubChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setBrandImageFile(file);
            setBrandImagePreview(URL.createObjectURL(file));
            setErrors((prev) => ({ ...prev, image: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitted(true);
        setCheckLoading(true);
        const newErrors = {};
        if (!nameAr.trim()) newErrors.name_ar = 'الرجاء إدخال اسم البائع.';
        if (!brandimageFile) newErrors.image = 'الرجاء اختيار صورة.';
        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            toast.warning('يرجى ملء جميع الحقول المطلوبة');
            setCheckLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('name_ar', nameAr);
        formData.append('image', brandimageFile);

        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/api/v1/brands`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true,
            });

            toast.success('تمت الإضافة بنجاح');
            setNameAr('');
            setBrandImageFile(null);
            setBrandImagePreview(null);
            setErrors({});
            setSubmitted(false);
            setCheckLoading(false);

            fetchBrands();

        } catch (error) {
            console.error('Error uploading Brand:', error);
            setCheckLoading(false);

            if (
                error.response &&
                error.response.data &&
                error.response.data.message === "Record with this name already exists in one of the languages"
            ) {
                toast.error('الاسم مستخدم بالفعل');
                setErrors({ name_ar: 'الاسم مستخدم بالفعل' });
                setCheckLoading(false);

            } else {
                toast.error('حدث خطأ أثناء الإضافة');
                setErrors({ image: 'برجاء تحويل الصور الي صيغة (.png, .jpg, .webp)' });
                setCheckLoading(false);

            }
        }
    };


    return (
        <div className='product-card' id='addBrand'>
            <h5><span>3</span> إضافة أسم بائع</h5>
            <form onSubmit={handleSubmit}>
                <div className='addProducts-Org'>
                    <div className='addProducts-Org-section' style={{ flex: 1 }}>
                        <div className='lable-col'>
                            <label>
                                اسم البائع <span className='star'><FaStarOfLife size={8} /></span>
                            </label>
                            <CreatableSelect
                                value={nameAr ? { label: nameAr, value: nameAr } : null}
                                onChange={(selectedOption) => {
                                    setNameAr(selectedOption ? selectedOption.value : '');
                                    setErrors((prev) => ({ ...prev, name_ar: '' }));
                                }}
                                options={userOptions}
                                placeholder="اختر اسم البائع (من الحسابات) أو اكتب اسماً جديداً"
                                isClearable
                                isSearchable
                                formatCreateLabel={(inputValue) => `إضافة "${inputValue}"`}
                                noOptionsMessage={() => "لا توجد حسابات"}
                                styles={customStyles}
                            />
                            {errors.name_ar && <small className="error-message">* {errors.name_ar}</small>}
                        </div>
                    </div>

                    <div className="addImg" style={{ flex: 1 }}>
                        <label htmlFor="brandImg" className="uploadBox">
                            {brandimagePreview ? (
                                <>
                                    <span className="text">تغير الصورة</span>
                                    <span className="plus"><LuReplace /></span>
                                </>
                            ) : (
                                <>
                                    <span className="plus"><AiOutlineCloudUpload /></span>
                                    <span className="text">اختر صورة</span>
                                </>
                            )}
                            <input
                                type="file"
                                id="brandImg"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={handleBrandImageSubChange}
                            />
                        </label>
                        {errors.image && <p className="error-message">* {errors.image}</p>}
                        {brandimagePreview && (
                            <div className="imgBox">
                                <img src={brandimagePreview} alt="Selected" />
                            </div>
                        )}
                    </div>
                </div>

                <div className='admin-btn-container' style={{ marginTop: '20px' }}>
                    {checkLoading ? (
                        <ThreeDot color="#ff6f33" size="small" text="جاري الحفظ..." textColor="#ff6f33" />
                    ) : (
                        <button type="submit" className='C-btn'>حفظ البراند</button>
                    )}
                </div>
            </form>
        </div>
    );
};





const AddCategories = () => {

    const { fetchCategories } = useSubCategories();
    const [checkLoading, setCheckLoading] = useState(false);
    const [nameAr, setNameAr] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [errors, setErrors] = useState({});
    const [submitted, setSubmitted] = useState(false);

    const { isAuthenticated, loading, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            navigate('/login');
        }
    }, [loading, isAuthenticated, navigate]);

    if (loading) {
        return (
            <div className='loading'>
                <ThreeDot color="#ff6f33" size="medium" text="جاري التحقق من الصلاحيات..." textColor="#ff6f33" />
            </div>
        )
    };


    const handleImageSubChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
            setErrors((prev) => ({ ...prev, image: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitted(true);
        setCheckLoading(true);
        const newErrors = {};
        if (!nameAr.trim()) newErrors.name_ar = 'الرجاء إدخال اسم الفئة.';
        if (!imageFile) newErrors.image = 'الرجاء اختيار صورة.';

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            toast.warning('يرجى ملء جميع الحقول المطلوبة');
            setCheckLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('name_ar', nameAr);
        formData.append('image', imageFile);

        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/api/v1/categories`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true,
            });

            toast.success('تمت الإضافة بنجاح');
            setNameAr('');
            setImageFile(null);
            setImagePreview(null);
            setErrors({});
            setSubmitted(false);
            setCheckLoading(false);

            fetchCategories();
        } catch (error) {
            console.error('Error uploading category:', error);
            setCheckLoading(false);

            if (
                error.response &&
                error.response.data &&
                error.response.data.message === "Record with this name already exists in one of the languages"
            ) {
                toast.error('الاسم مستخدم بالفعل');
                setErrors({ name_ar: 'الاسم مستخدم بالفعل' });
                setCheckLoading(false);

            } else {
                toast.error('حدث خطأ أثناء الإضافة');
                setErrors({ image: 'برجاء تحويل الصور الي صيغة (.png, .jpg, .webp)' });
                setCheckLoading(false);

            }
        }
    };

    return (
        <div className='admin_page' id='addProducts'>
            <div className='admin_page_tabl'>
                <ToastContainer toastClassName="custom-toast" position="top-right" autoClose={3000} />
                <div className='secHead'>
                    <h5>أقسام المتجر</h5>
                </div>

                <div className='products-grid'>
                    {user?.role === 'superAdmin' && (
                        <div className='product-card'>
                            <h5><span>1</span> إضافة فئة رئيسية</h5>
                            <form onSubmit={handleSubmit}>
                                <div className='addProducts-Org'>
                                    <div className='addProducts-Org-section' style={{ flex: 1 }}>
                                        <div className='lable-col'>
                                            <label>
                                                اسم الفئة الرئيسي <span className='star'><FaStarOfLife size={8} /></span>
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="أدخل اسم الفئة الرئيسية"
                                                value={nameAr}
                                                onChange={(e) => {
                                                    setNameAr(e.target.value);
                                                    setErrors((prev) => ({ ...prev, name_ar: '' }));
                                                }}
                                                className={submitted && errors.name_ar ? 'input-error' : ''}
                                            />
                                            {errors.name_ar && <small className="error-message">* {errors.name_ar}</small>}
                                        </div>
                                    </div>

                                    <div className="addImg" style={{ flex: 1 }}>
                                        <label htmlFor="mainCatImg" className="uploadBox">
                                            {imagePreview ? (
                                                <>
                                                    <span className="text">تغير الصورة</span>
                                                    <span className="plus"><LuReplace /></span>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="plus"><AiOutlineCloudUpload /></span>
                                                    <span className="text">اختر صورة</span>
                                                </>
                                            )}
                                            <input
                                                type="file"
                                                id="mainCatImg"
                                                accept="image/*"
                                                style={{ display: 'none' }}
                                                onChange={handleImageSubChange}
                                            />
                                        </label>
                                        {errors.image && <p className="error-message">* {errors.image}</p>}
                                        {imagePreview && (
                                            <div className="imgBox">
                                                <img src={imagePreview} alt="Selected" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className='admin-btn-container' style={{ marginTop: '20px', display: 'flex', gap: '15px', alignItems: 'center' }}>
                                    {checkLoading ? (
                                        <ThreeDot color="#ff6f33" size="small" text="جاري الحفظ..." textColor="#ff6f33" />
                                    ) : (
                                        <button type="submit" className='C-btn'>حفظ الفئة الرئيسية</button>
                                    )}
                                    <div className='admin-btn-groub' style={{ display: 'flex', gap: '10px' }}>
                                        <Link to='/' className='C-btn' style={{ background: 'transparent', color: 'var(--main-color)', border: '1px solid var(--main-color)' }}>كل الفئات</Link>
                                        <LinkS to='addSubCat' smooth={true} className='C-Sbtn' style={{ cursor: 'pointer' }}>إضافة فئة فرعية</LinkS>
                                        <LinkS to='addBrand' smooth={true} className='C-Sbtn' style={{ cursor: 'pointer' }}>إضافة اسم بائع</LinkS>
                                    </div>
                                </div>
                            </form>
                        </div>
                    )}

                    {user?.role === 'superAdmin' && <br />}
                    <AddSubCategories />
                    {user?.role === 'superAdmin' && (
                        <>
                            <br />
                            <AddBrand />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddCategories;
