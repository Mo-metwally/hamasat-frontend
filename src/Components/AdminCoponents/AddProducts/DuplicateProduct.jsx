import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FaImage, FaImages, FaStarOfLife } from 'react-icons/fa';
import { LuReplace } from 'react-icons/lu';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { useAuth } from '../../../Context/AuthContext';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { useSubCategories } from '../../../hooks/useCategories';
import { Switch } from '@mui/material';
import DescriptionForm from '../DescriptionForm/DescriptionForm';
import { ThreeDot } from 'react-loading-indicators';
import { Helmet } from 'react-helmet-async';
import { useProducts } from '../../../hooks/useProducts';
import ParentPreviow from '../ParentPreviow/ParentPreviow';


const colorOptions = [
    { value: 'أحمر', label: 'أحمر' },
    { value: 'أزرق', label: 'أزرق' },
    { value: 'أخضر', label: 'أخضر' },
    { value: 'أسود', label: 'أسود' },
];

const sizeOptions = [
    { value: '1 قطعة', label: '1 قطعة' },
    { value: '3 قطع', label: '3 قطع' },
    { value: '6 قطع', label: '6 قطع' },
    { value: '12 قطع', label: '12 قطع' },
];
const size2Options = [
    { value: 'صغير', label: 'صغير' },
    { value: 'متوسط', label: 'متوسط' },
    { value: 'كبير', label: 'كبير' },
    { value: 'كبير جداَ', label: 'كبير جدًا' },
    { value: 'ضخم', label: 'ضخم' },
];

const DuplicateProduct = () => {
    const {
        categories,
        subcategories,
        categoryOptions,
        brandOptions,
        loading
    } = useSubCategories();

    const { products, fetchProducts } = useProducts();

    const [checkLoading, setCheckLoading] = useState(false);
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [images, setImages] = useState([]);
    const [imagesPreview, setImagesPreview] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    // eslint-disable-next-line no-unused-vars
    const [selectedSubCategory, setSelectedSubCategory] = useState(null);
    const [filteredSubcategoryOptions, setFilteredSubcategoryOptions] = useState([]);
    const [errors, setErrors] = useState({});
    // eslint-disable-next-line no-unused-vars
    const [submitted, setSubmitted] = useState(false);
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { productId, categoryId, subcategoryId, brandId } = location.state || {};
    const [selectedParent, setSelectedParent] = useState(null);

    const [form, setForm] = useState({
        name_ar: '',
        slug: '',
        model_ar: '',
        model_en: '',
        description_ar: '',
        description_en: '',
        price: '',
        basePrice: '',
        stock: '',
        categoryId: '',
        subcategoryId: '',
        newExpireDate: "",
        saleExpireDate: "",
        brandId: '',
        sold: '',
        keywords: '',
        isNew: true,
        isSale: false,
        parentId: "",
        color_ar: [],
        size_ar: [],
        size_en: [],
    });

    useEffect(() => {
        if (categoryId && subcategoryId && productId) {
            const parentProduct = products.find((p) => p.id === productId);

            if (parentProduct) {
                setForm((prev) => ({
                    ...prev,
                    categoryId,
                    subcategoryId,
                    brandId,
                    parentId: productId,
                    name_ar: parentProduct.name_ar || "",
                    slug: parentProduct.slug || "",
                    model_ar: parentProduct.model_ar || "",
                    model_en: parentProduct.model_en || "",
                    description_ar: parentProduct.description_ar || "",
                    description_en: parentProduct.description_en || "",
                    price: parentProduct.price || "",
                    basePrice: parentProduct.basePrice || "",
                    salePrice: parentProduct.salePrice || "",
                    stock: parentProduct.stock || "",
                    sold: 0,
                    keywords: parentProduct.keywords?.join(", ") || "",
                    isNew: parentProduct.isNew || false,
                    isSale: parentProduct.isSale || false,
                    saleExpireDate: parentProduct.saleExpireDate
                        ? parentProduct.saleExpireDate.slice(0, 10)
                        : "",
                    newExpireDate: parentProduct.newExpireDate
                        ? parentProduct.newExpireDate.slice(0, 10)
                        : "",
                    color_ar: parentProduct.color_ar || [],
                    size_ar: parentProduct.size_ar || [],
                    size_en: parentProduct.size_en || [],
                }));
                // ✅ تحديث السبكاتيجوري مع الفئة
                setSelectedCategory(categories.find(cat => cat.id === parentProduct.categoryId));

                // ✅ معالجة الصور
                setImagePreview(parentProduct.image || '');
                setImagesPreview(parentProduct.images || []);
                setSelectedParent(parentProduct.id);

            }
        }
    }, [categoryId, subcategoryId, productId, brandId, products, categories]);


    useEffect(() => {
        if (selectedCategory) {
            const filteredSubcategories = subcategories.filter(subcategory => subcategory.categoryId === selectedCategory.id);
            const options = filteredSubcategories.map(sub => ({
                label: sub.name_ar,
                value: sub.id,
            }));
            setFilteredSubcategoryOptions(options);
        } else {
            setFilteredSubcategoryOptions([]);
        }
    }, [selectedCategory, subcategories]);
    // Handle category selection
    const handleCategoryChange = (selectedOption) => {
        const categoryId = selectedOption ? selectedOption.value : '';
        setSelectedCategory(categories.find(cat => cat.id === categoryId));
        setForm(prev => ({ ...prev, categoryId: categoryId }));
    };

    // Handle subcategory selection
    const handleSubcategoryChange = (selectedOption) => {
        const subcategoryId = selectedOption ? selectedOption.value : '';
        setSelectedSubCategory(form.subcategoryId);
        setForm(prev => ({ ...prev, subcategoryId: subcategoryId }));
    };

    // فلترة المنتجات بناءً على الفئة الفرعية المختارة
    const filteredParentOptions = [
        { value: "", label: "منتج جديد +" },
        ...products
            .filter(
                (prod) =>
                    prod.subcategoryId === form.subcategoryId &&
                    (!prod.parentId || prod.parentId === "")
            ) // ✅ يظهر فقط المنتجات الأب
            .map((prod) => ({
                value: prod.id,
                label: prod.name_ar, // أو prod.name_en
            })),
    ];


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

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
            setErrors(prev => ({ ...prev, image: '' }));
        }
    };

    const handleMultipleImagesChange = (e) => {
        const files = Array.from(e.target.files);
        setImages(files);
        setImagesPreview(files.map(file => URL.createObjectURL(file)));
        setErrors(prev => ({ ...prev, images: '' }));
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setForm((prev) => {
            let updatedForm = {
                ...prev,
                [name]: type === "checkbox" ? checked : value,
            };

            // ✅ لو طفى الخصم صَفّر الحقول
            if (name === "isSale" && !checked) {
                updatedForm.salePrice = "";
                updatedForm.saleExpireDate = "";
            }

            // ✅ لو طفى "وصل حديثاً" صَفّر التاريخ
            if (name === "isNew" && !checked) {
                updatedForm.newExpireDate = "";
            }

            return updatedForm;
        });

        // ✅ إزالة الخطأ تلقائيًا عند التعديل
        if (errors[name]) {
            setErrors((prev) => {
                const updatedErrors = { ...prev };
                delete updatedErrors[name];
                return updatedErrors;
            });
        }
    };

    const prepareFormData = (form) => {
        const cleaned = { ...form };

        // ✅ لو مفيش خصم
        if (!cleaned.isSale) {
            cleaned.salePrice = "";
            cleaned.saleExpireDate = "";
        }

        // ✅ لو مش "وصل حديثاً"
        if (!cleaned.isNew) {
            cleaned.newExpireDate = "";
        }

        return cleaned;
    };

    const handleSubmit = async (e) => {

        const sanitizeNumber = (value) => {
            const num = parseInt(value, 10);
            return isNaN(num) ? 0 : num;
        };

        setCheckLoading(true);

        const sanitizedForm = prepareFormData(form);

        const formDataToSend = {
            ...sanitizedForm,
            price: sanitizeNumber(sanitizedForm.price),
            basePrice: sanitizeNumber(sanitizedForm.basePrice),
            salePrice: sanitizeNumber(sanitizedForm.salePrice),
            stock: sanitizeNumber(sanitizedForm.stock),
            keywords: sanitizedForm.keywords?.toString().trim()
                ? [sanitizedForm.keywords.toString().trim()]
                : [],
            color_ar: form.color_ar ? [form.color_ar] : [],
            size_ar: form.size_ar ? [form.size_ar] : [],
            size_en: form.size_en ? [form.size_en] : [],
        };


        if (!sanitizedForm.parentId) {
            delete formDataToSend.parentId;
        } else {
            formDataToSend.parentId = sanitizedForm.parentId;
        }

        // console.log("📦 Payload to Backend:", formDataToSend);
        e.preventDefault();
        const newErrors = {};

        if (!form.name_ar) newErrors.name_ar = 'الرجاء إدخال اسم المنتج بالعربية.';
        if (!form.slug) newErrors.slug = 'الرجاء إدخال وصف قصير للمنتج.';
        if (!form.model_ar) newErrors.model_ar = 'الرجاء إدخال موديل المنتج.';
        if (!form.model_en) newErrors.model_en = 'الرجاء إدخال المنشأ/الخامة';
        if (!form.description_ar) newErrors.description_ar = 'الرجاء إدخال وصف المنتج.';

        if (!form.stock) newErrors.stock = 'الرجاء إدخال الكمية.';
        if (!form.color_ar) newErrors.color_ar = 'الرجاء أختيار اللون';
        if (!form.size_en) newErrors.size_ar = 'الرجاء أختيار العدد القطع';
        if (!form.size_ar) newErrors.size_ar = 'الرجاء أختيار الحجم.';
        if (!form.categoryId) newErrors.categoryId = 'الرجاء تحديد الفئة.';
        if (!form.subcategoryId) newErrors.subcategoryId = 'الرجاء تحديد الفئة الفرعية.';
        if (!form.brandId) newErrors.brandId = 'الرجاء تحديد البراند.';
        if (!image && !form.image) {
            newErrors.image = 'الرجاء اختيار او تغير الصورة الرئيسية.';
        }

        if ((images && images.length > 8) || (form.images && form.images.length > 8)) {
            newErrors.images = `تم اختيار ${imagesPreview.length} صورة، برجاء اختيار 8 صور أو أقل.`;
        }

        if ((!images || images.length === 0) && (!form.images || form.images.length === 0)) {
            newErrors.images = 'الرجاء اختيار او تغير الصور متعددة.';
        }

        if (form.isSale) {
            if (!form.salePrice) newErrors.salePrice = 'الرجاء إدخال السعر بعد الخصم.';
            if (!form.saleExpireDate) newErrors.saleExpireDate = 'الرجاء إدخال تاريخ انتهاء الخصم.';
        }
        if (form.isNew) {
            if (!form.newExpireDate) newErrors.newExpireDate = 'الرجاء إدخال تاريخ انتهاء علامة جديد.';
        }
        if (!form.price) newErrors.price = 'الرجاء إدخال السعر.';
        if (!form.basePrice) newErrors.basePrice = 'الرجاء إدخال السعر الأساسي.';

        if (Number(form.price) < Number(form.basePrice)) {
            const confirmSave = window.confirm('سعر البيع أقل من سعر الجملة هل ترغب في الحفظ؟');
            if (!confirmSave) {
                setSubmitted(false);
                setCheckLoading(false);
                return;
            }
        }
        if (form.isSale && Number(form.salePrice) <= Number(form.basePrice)) {
            const confirmSave = window.confirm('سعر بعد الخصم نفس أو أقل من سعر الجملة. هل ترغب في الحفظ؟');
            if (!confirmSave) {
                setSubmitted(false);
                setCheckLoading(false);
                return;
            }
        }

        if (form.isSale && Number(form.salePrice) >= Number(form.price)) {
            const confirmSave = window.confirm('سعر بعد الخصم نفس أو أعلى من سعر المنتج. هل ترغب في الحفظ؟');
            if (!confirmSave) {
                setSubmitted(false);
                setCheckLoading(false);
                return;
            }
        }

        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) {
            setSubmitted(false);
            setCheckLoading(false);
            Object.values(newErrors).forEach(msg => toast.error(msg));
            toast.warning('يرجى ملء جميع الحقول المطلوبة');
            return;
        }



        setSubmitted(true);

        const formData = new FormData();
        Object.entries(formDataToSend).forEach(([key, val]) => {
            if (Array.isArray(val)) {
                val.forEach((item) => formData.append(`${key}[]`, item));
            } else {
                // ✅ لا تبعت التاريخ لو القيمة فاضية
                if ((key === "saleExpireDate" || key === "newExpireDate") && !val) {
                    return;
                }
                formData.append(key, val);
            }
        });


        formData.append('image', image);
        images.forEach((img) => formData.append('images', img));

        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/api/v1/products`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true,
            });

            toast.success('تمت إضافة منتج فرعي بنجاح');
            setTimeout(() => {
                navigate('/admin/productslist', { state: { updated: true } });
                fetchProducts();
            }, 1500);

            setImage(null);
            setImagePreview(null);
            setImages([]);
            setImagesPreview([]);
            setErrors({});
            setSubmitted(false);
            setCheckLoading(false);
            fetchProducts();
        } catch (error) {
            console.error('Error uploading product:', error);
            setSubmitted(false);
            setCheckLoading(false);
            if (
                error.response &&
                error.response.data &&
                error.response.data.message === "Record with this name already exists in one of the languages"
            ) {
                toast.error('الاسم مستخدم بالفعل');
                setErrors({ name_ar: 'الاسم مستخدم بالفعل' });
                setSubmitted(false);
                setCheckLoading(false);
            } else {
                setErrors({ slug: 'برجاء التأكد من تغير الوصف القصير' });
                toast.error('برجاء التأكد من تغير الاسم او الوصف القصير');
                setCheckLoading(false);
            }


        }
    };

    const customStyles = {
        noOptionsMessage: (base) => ({
            ...base,
            color: 'red',
            textAlign: 'right',
        }),
    };

    return (
        <>
            <Helmet>
                <title>إضافة منتج فرعي</title>
                <meta
                    name="description"
                    content="إضافة منتجات جديدة إلى متجر همسات هوم وإدارتها بسهولة."
                />
                <meta name="robots" content="noindex, nofollow" />
                <link rel="canonical" href={`${process.env.REACT_APP_API_URL}/admin/duplicateproduct`} />
            </Helmet>


            <div className='admin_page' id='addProducts'>
                <div className='admin_page_tabl'>
                    <ToastContainer toastClassName="custom-toast" position="top-right" autoClose={3000} />
                    <div className='secHead'><h5>إضافة فرعي</h5></div>
                    <div className='admin_page_tabl_cr'>

                        <ParentPreviow parentId={selectedParent} />

                        <form onSubmit={handleSubmit} className='mainCatForm'>
                            <h5><span>الفئة والصنف</span></h5>
                            <div className='addProducts-Org-section'>
                                <div className="addProducts-Org selectCat ">
                                    {/* الفئة */}
                                    <label className="custom-select-wrapper noSelect">
                                        اختر الفئة <span className="star"><FaStarOfLife /></span>
                                        <Select
                                            className="selector "
                                            options={categoryOptions}
                                            value={categoryOptions.find(option => option.value === form.categoryId)}
                                            onChange={handleCategoryChange}
                                            placeholder="اختر فئة..."
                                            isClearable
                                            isSearchable
                                            styles={customStyles}
                                            isLoading={loading}
                                            noOptionsMessage={() => 'لا يوجد نتائج'}
                                        />
                                    </label>
                                    {errors.categoryId && <p className="error-message">* {errors.categoryId}</p>}

                                    {/* Subcategory Selector */}
                                    <label className="custom-select-wrapper noSelect">
                                        اختر الفئة الفرعية <span className="star"><FaStarOfLife /></span>
                                        <Select
                                            className="selector "
                                            options={filteredSubcategoryOptions}
                                            value={filteredSubcategoryOptions.find(option => option.value === form.subcategoryId)}
                                            onChange={handleSubcategoryChange}
                                            placeholder="اختر فئة فرعية..."
                                            isDisabled={!form.categoryId}  // Disable if no category is selected
                                            isClearable
                                            isSearchable
                                            styles={customStyles}
                                            isLoading={loading}
                                            noOptionsMessage={() => 'لا يوجد نتائج'}
                                        />
                                    </label>
                                    {errors.subcategoryId && <p className="error-message">* {errors.subcategoryId}</p>}

                                    {/* البراند */}
                                    <label className='custom-select-wrapper noSelect'>
                                        اختر البراند <span className='star'><FaStarOfLife /></span>
                                        <Select
                                            className='selector '
                                            options={brandOptions}
                                            value={brandOptions.find(option => option.value === form.brandId)}
                                            onChange={(selectedOption) => {
                                                const value = selectedOption ? selectedOption.value : '';
                                                setForm(prev => ({ ...prev, brandId: value }));
                                                setErrors(prev => ({ ...prev, brandId: '' }));
                                            }}
                                            placeholder="اختر البراند..."
                                            noOptionsMessage={() => 'لا يوجد نتائج'}
                                            isClearable
                                            isSearchable
                                            styles={customStyles}
                                        />
                                    </label>
                                    {errors.brandId && <p className="error-message">* {errors.brandId}</p>}

                                    <label className="custom-select-wrapper noSelect">
                                        اختر المنتج الرئيسي
                                        <Select
                                            className="selector "
                                            options={filteredParentOptions}
                                            value={
                                                filteredParentOptions.find(option => option.value === form.parentId) ||
                                                filteredParentOptions[0]
                                            }
                                            placeholder="اختر المنتج الرئيسي..."
                                            isClearable
                                            isSearchable
                                            styles={customStyles}
                                            isLoading={!products}
                                            noOptionsMessage={() => 'لا يوجد منتجات'}
                                        />
                                    </label>
                                </div>
                            </div>

                            <h5><span>بيانات اساسية</span></h5>
                            <div className='addProducts-Org-section'>
                                <div className="addProducts-Org">
                                    <label className="lable-col" htmlFor='name_ar'>
                                        اسم المنتج
                                        <input name="name_ar" value={form.name_ar} onChange={handleChange} />
                                        {errors.name_ar && <p className="error-message">* {errors.name_ar}</p>}
                                    </label>
                                    <label className="lable-col" htmlFor='name_en'>
                                        وصف قصير
                                        <input name="slug" value={form.slug} onChange={handleChange} />
                                        {errors.slug && <p className="error-message">* {errors.slug}</p>}
                                    </label>
                                </div>
                                <div className="addProducts-Org">

                                    <label className="lable-col" htmlFor='model_ar'>
                                        البراند
                                        <input name="model_ar" value={form.model_ar} onChange={handleChange} />
                                        {errors.model_ar && <p className="error-message">* {errors.model_ar}</p>}
                                    </label>

                                    <label className="lable-col" htmlFor='model_en'>
                                        المنشأ/الخامة
                                        <input name="model_en" value={form.model_en} onChange={handleChange} />
                                        {errors.model_en && <p className="error-message">* {errors.model_en}</p>}
                                    </label>
                                </div>

                                <div className="addProducts-Org">

                                    <label className="lable-col" htmlFor='basePrice'>
                                        السعر الأساسي
                                        <input name="basePrice" type="number" value={form.basePrice} onChange={handleChange} />
                                        {errors.basePrice && <p className="error-message">* {errors.basePrice}</p>}
                                    </label>

                                    <label className="lable-col" htmlFor='price'>
                                        السعر
                                        <input name="price" type="number" value={form.price} onChange={handleChange} />
                                        {errors.price && <p className="error-message">* {errors.price}</p>}
                                    </label>

                                </div>
                            </div>
                            <div className="addProducts-Org">
                                <label className="lable-col" htmlFor='stock'>
                                    المخزون
                                    <input name="stock" type="number" value={form.stock} onChange={handleChange} min="0" />
                                    {errors.stock && <p className="error-message">* {errors.stock}</p>}
                                </label>

                                <label className="lable-col" htmlFor="sold">
                                    المبيعات
                                    <input type="number" name="sold" value={form.sold} onChange={handleChange} min="0" />
                                </label>
                            </div>

                            <div className="addProducts-Org">
                                <label className="lable-col" htmlFor="size_ar">
                                    <p>أختر العدد <small> (يمكن ادخال قيمة جديدة) </small></p>
                                    <CreatableSelect
                                        className="selector"
                                        name="size_ar"
                                        options={sizeOptions}
                                        value={form.size_ar?.map((v) => ({ value: v, label: v }))} // علشان يقرأ القيم القديمة من الـ form
                                        onChange={(selected) =>
                                            setForm({
                                                ...form,
                                                size_ar: selected ? [selected.value] : [], // يرجع Array فيها قيمة واحدة
                                            })
                                        }
                                        placeholder="اختر عدد القطع"
                                        isClearable
                                        formatCreateLabel={(inputValue) => `إضافة "${inputValue}"`}
                                        styles={{
                                            input: (base) => ({ ...base, direction: 'rtl' }),
                                            menu: (base) => ({ ...base, direction: 'rtl' }),
                                        }}
                                    />

                                    {errors.size_ar && <p className="error-message">* {errors.size_ar}</p>}
                                </label>
                                <label className="lable-col" htmlFor="size_en">
                                    <p>أختر الحجم <small>(يمكن ادخال قيمة جديدة)</small></p>
                                    <CreatableSelect
                                        className="selector"
                                        name="size_en"
                                        options={size2Options}
                                        value={form.size_en?.map((v) => ({ value: v, label: v }))} // علشان يقرأ القيم القديمة من الـ form
                                        onChange={(selected) =>
                                            setForm({
                                                ...form,
                                                size_en: selected ? [selected.value] : [], // يرجع Array فيها قيمة واحدة
                                            })
                                        }
                                        placeholder="اختر عدد القطع"
                                        isClearable
                                        formatCreateLabel={(inputValue) => `إضافة "${inputValue}"`}
                                        styles={{
                                            input: (base) => ({ ...base, direction: 'rtl' }),
                                            menu: (base) => ({ ...base, direction: 'rtl' }),
                                        }}
                                    />

                                    {errors.size_en && <p className="error-message">* {errors.size_en}</p>}
                                </label>
                            </div> *
                            <label className="lable-col" htmlFor="color_ar">
                                <p>اللون <small>(يمكن ادخال قيمة جديدة)</small></p>
                                <CreatableSelect
                                    className="selector"
                                    name="color_ar"
                                    options={colorOptions}
                                    value={form.color_ar?.map((v) => ({ value: v, label: v }))} // علشان يقرأ القيم القديمة من الـ form
                                    onChange={(selected) =>
                                        setForm({
                                            ...form,
                                            color_ar: selected ? [selected.value] : [], // يرجع Array فيها قيمة واحدة
                                        })
                                    }
                                    placeholder="اختر عدد القطع"
                                    isClearable
                                    formatCreateLabel={(inputValue) => `إضافة "${inputValue}"`}
                                    styles={{
                                        input: (base) => ({ ...base, direction: 'rtl' }),
                                        menu: (base) => ({ ...base, direction: 'rtl' }),
                                    }}
                                />
                                {errors.color_ar && <p className="error-message">* {errors.color_ar}</p>}
                            </label>

                            <br />
                            {/* <label className="lable-col" htmlFor='keywords'>
                                بندل
                                <input
                                    type="text"
                                    name="keywords"
                                    value={form.keywords}
                                    onChange={(e) => setForm({ ...form, keywords: e.target.value })}
                                />
                                {errors.keywords && <p className="error-message">* {errors.keywords}</p>}
                            </label> */}


                            <br />
                            <div className="addProducts-Org">
                                <div className='lable-col'>
                                    <strong style={{ paddingBottom: '0.8rem' }}>الوصف</strong>
                                    <DescriptionForm name="description_ar" value={form.description_ar} onChange={handleChange} />
                                    {errors.description_ar && <p className="error-message">* {errors.description_ar}</p>}
                                </div>
                            </div>
                            <br />
                            <div className="addProducts-Org">
                                <div className='lable-col'>
                                    <strong style={{ paddingBottom: '0.8rem' }}>الوصف إضافي + </strong>
                                    <DescriptionForm name="description_en" value={form.description_en} onChange={handleChange} />
                                    {errors.description_en && <p className="error-message">* {errors.description_en}</p>}
                                </div>
                            </div>
                            <br />
                            <div className='check_sec'>
                                <Switch color="warning"
                                    id="isSale"
                                    name="isSale"
                                    checked={form.isSale}
                                    onChange={handleChange} />
                                <h5><span>الخصم والعروض</span></h5>
                            </div>
                            <div className='optinalSec'>
                                <div className={`secBlocked ${form.isSale ? 'secUnBlock' : ''}`}> <p>تحديد المنتج في صفحة العروض</p></div>
                                <div className="addProducts-Org">
                                    <label className="lable-col" htmlFor="salePrice">
                                        السعر بعد الخصم
                                        <input
                                            type="number"
                                            disabled={!form.isSale}
                                            name="salePrice"
                                            value={form.isSale ? form.salePrice || "" : ""}   // 👈 خليه فاضي مش صفر
                                            onChange={handleChange}
                                        />
                                        {errors.salePrice && <p className="error-message">* {errors.salePrice}</p>}
                                    </label>

                                    <label className="lable-col" htmlFor="saleExpireDate">
                                        انتهاء الخصم
                                        <input
                                            type="date"
                                            disabled={!form.isSale}
                                            name="saleExpireDate"
                                            value={form.isSale ? form.saleExpireDate || "" : ""} // 👈 يفضل يبقى "" مش صفر
                                            onChange={handleChange}
                                        />
                                        {errors.saleExpireDate && <p className="error-message">* {errors.saleExpireDate}</p>}
                                    </label>
                                </div>
                            </div>

                            <br />
                            <div className='check_sec'>
                                <Switch color="warning"
                                    id="isNew"
                                    name="isNew"
                                    checked={form.isNew}
                                    onChange={handleChange} />
                                <h5><span>وصل حديثاً</span></h5>
                            </div>
                            <div className='optinalSec'>
                                <div className={`secBlocked ${form.isNew ? 'secUnBlock' : ''}`}> <p>تحديد المنتج في صفحة وصل حديثاً</p> </div>
                                <div className="addProducts-Org">
                                    <label className="lable-col" htmlFor="newExpireDate">
                                        انتهاء الجديد
                                        <input type="date" disabled={!form.isNew} name="newExpireDate" id="newExpireDate" value={form.newExpireDate} onChange={handleChange} />
                                        {errors.newExpireDate && <p className="error-message">* {errors.newExpireDate}</p>}
                                    </label>

                                </div>
                            </div>

                            <br />
                            <h5><span>صور المنتج</span></h5>
                            <div className='addProducts-Org-section'>
                                <div className='addProducts-Org'>
                                    <div className="addImg" >
                                        <label htmlFor="mainImg" className="uploadBox">
                                            {imagePreview ? (
                                                <>
                                                    <span className="text">تغيير الصورة</span>
                                                    <span className="plus"><LuReplace /></span>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="plus"><FaImage /></span>
                                                    <span className="text">اختر صورة رئيسية</span>
                                                </>
                                            )}
                                            <input type="file" id="mainImg" accept="image/*" hidden onChange={handleImageChange} />
                                        </label>
                                        {errors.image && <p className="error-message">* {errors.image}</p>}
                                        {imagePreview && <img src={imagePreview} alt="Main" style={{ maxWidth: '200px', marginTop: '10px' }} />}
                                    </div>

                                    <div className="addImg">
                                        <label htmlFor="imagesUpload" className="uploadBox">
                                            <span className="plus"><FaImages /></span>
                                            {imagesPreview ? (
                                                <span className="text">تم اختيار <strong>{imagesPreview.length}</strong> صور</span>
                                            ) : (
                                                <span className="text">اختر صور متعددة</span>
                                            )}
                                            <input type="file" id="imagesUpload" accept="image/*" multiple hidden onChange={handleMultipleImagesChange} />
                                        </label>
                                        {errors.images && <p className="error-message">* {errors.images}</p>}
                                        {imagesPreview.length > 0 && (
                                            <div className="imgBox">
                                                {imagesPreview.map((src, idx) => (
                                                    <img key={idx} src={src} alt={`product-${idx}`} style={{ maxWidth: '150px', margin: '5px' }} />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className='admin-btn-container'>
                                {checkLoading ? (
                                    <ThreeDot color="#ff6f33" size="small" text="جاري الحفظ..." textColor="#ff6f33" />
                                ) :
                                    (
                                        <button type="button" onClick={handleSubmit} className='C-btn'>
                                            حفظ
                                        </button>
                                    )}
                                <div className='admin-btn-groub'>
                                    <Link to='/admin/productslist' className='C-btn'>إلغاء</Link>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
                <br />
            </div>
        </>
    );
};

export default DuplicateProduct;
