import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import CreatableSelect from 'react-select/creatable';
import Switch from '@mui/material/Switch';
import DescriptionForm from '../DescriptionForm/DescriptionForm';
import { FaImage, FaImages, FaTimes } from 'react-icons/fa';
import { LuReplace } from 'react-icons/lu';
import '../AddProducts/AddProducts.css';

import { useProducts } from '../../../hooks/useProducts';
import { ThreeDot } from 'react-loading-indicators';
import Select from 'react-select';
import ParentPreviow from '../ParentPreviow/ParentPreviow';

const EditProduct = () => {
    const [checkLoading, setCheckLoading] = useState(false);
    const { setProducts, fetchProducts } = useProducts();
    const { itemId } = useParams();
    const navigate = useNavigate();
    const originalData = useRef({});
    const [product, setProduct] = useState(null);
    const [selectedParent, setSelectedParent] = useState(null);

    // 📸 حالات الصور
    const [mainImageFile, setMainImageFile] = useState(null);
    const [mainImagePreview, setMainImagePreview] = useState(null);
    const [existingMainImage, setExistingMainImage] = useState(null);

    const [existingImages, setExistingImages] = useState([]);
    const [newImageFiles, setNewImageFiles] = useState([]);
    const [newImagesPreview, setNewImagesPreview] = useState([]);

    const [form, setForm] = useState({
        parentId: '',
        name_ar: '',
        slug: '',
        model_ar: '',
        model_en: '',
        basePrice: '',
        price: '',
        stock: '',
        sold: '',
        keywords: [],
        size_ar: [],
        size_en: [],
        color_ar: [],
        description_ar: '',
        description_en: '',
        salePrice: '',
        saleExpireDate: '',
        newExpireDate: '',
        isSale: false,
        isNew: false
    });

    const [errors, setErrors] = useState({});

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

    // إعداد وتحديث صور المنتج عند التحميل أو التغيير
    const setupProductImages = (prod) => {
        if (!prod) return;
        setExistingMainImage(prod.image || '');
        setMainImagePreview(prod.image || '');
        setMainImageFile(null);

        setExistingImages(Array.isArray(prod.images) ? prod.images : []);
        setNewImageFiles([]);
        setNewImagesPreview([]);
    };

    // جلب المنتج الأساسي عند فتح الصفحة
    useEffect(() => {
        const loadProduct = async () => {
            await fetchProducts();
            await handleProductLoad(product || []);
        };
        setSelectedParent(itemId);

        const handleProductLoad = async (productsList) => {
            const prod = Array.isArray(productsList)
                ? productsList.find((p) => p.id === itemId)
                : productsList;
            if (prod) {
                setProduct(prod);
                originalData.current = prod;
                setForm(mapProductToForm(prod));
                setupProductImages(prod);
            } else {
                try {
                    const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/products/${itemId}`);
                    const fetchedProduct = data?.data;
                    if (fetchedProduct) {
                        setProduct(fetchedProduct);
                        originalData.current = fetchedProduct;
                        setForm(mapProductToForm(fetchedProduct));
                        setupProductImages(fetchedProduct);
                    }
                } catch (err) {
                    toast.error("فشل تحميل بيانات المنتج");
                }
            }
        };

        loadProduct();
    }, [itemId, product, fetchProducts]);

    // تحويل المنتج للفورم
    const mapProductToForm = (product) => ({
        id: product.id,
        parentId: product.parentId || null,
        name_ar: product.name_ar || '',
        slug: product.slug || '',
        model_ar: product.model_ar || '',
        model_en: product.model_en || '',
        basePrice: product.basePrice || '',
        price: product.price || '',
        stock: product.stock || '',
        sold: product.sold || '',
        color_ar: product.color_ar || [],
        size_ar: product.size_ar || [],
        size_en: product.size_en || [],
        description_ar: product.description_ar || '',
        description_en: product.description_en || '',
        salePrice: product.salePrice || '',
        saleExpireDate: product.saleExpireDate ? product.saleExpireDate.slice(0, 10) : '',
        newExpireDate: product.newExpireDate ? product.newExpireDate.slice(0, 10) : '',
        isSale: Boolean(product.isSale),
        isNew: Boolean(product.isNew),
        keywords: Array.isArray(product.keywords) && product.keywords.length > 0 ? product.keywords[0] : '',
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name === 'isSale' && !checked) {
            setForm((prev) => ({
                ...prev,
                isSale: false,
                salePrice: 0,
                saleExpireDate: ''
            }));
        } else if (name === 'isNew' && !checked) {
            setForm((prev) => ({
                ...prev,
                isNew: false,
                newExpireDate: ''
            }));
        } else {
            setForm((prev) => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    // معالجة تغيير الصورة الرئيسية
    const handleMainImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setMainImageFile(file);
            setMainImagePreview(URL.createObjectURL(file));
            setErrors((prev) => ({ ...prev, image: '' }));
        }
    };

    // حذف الصورة الرئيسية
    const handleRemoveMainImage = () => {
        setMainImageFile(null);
        setMainImagePreview(null);
        setExistingMainImage(null);
    };

    // معالجة إضافة صور متعددة جديدة
    const handleMultipleImagesChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            setNewImageFiles((prev) => [...prev, ...files]);
            const newPreviews = files.map((file) => URL.createObjectURL(file));
            setNewImagesPreview((prev) => [...prev, ...newPreviews]);
            setErrors((prev) => ({ ...prev, images: '' }));
        }
    };

    // حذف صورة من الصور القديمة المحفوظة
    const handleRemoveExistingImage = (indexToRemove) => {
        setExistingImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    };

    // حذف صورة من الصور الجديدة المرفوعة
    const handleRemoveNewImage = (indexToRemove) => {
        setNewImageFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
        setNewImagesPreview((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setCheckLoading(true);

        const newErrors = {};

        if (!form.name_ar) newErrors.name_ar = 'الرجاء إدخال اسم المنتج بالعربية.';
        if (!form.slug) newErrors.slug = 'الرجاء إدخال وصف قصير للمنتج.';
        if (!form.model_ar) newErrors.model_ar = 'الرجاء إدخال موديل المنتج.';
        if (!form.model_en) newErrors.model_en = 'الرجاء إدخال المنشأ/الخامة';
        if (!form.description_ar) newErrors.description_ar = 'الرجاء إدخال وصف المنتج.';
        if (!form.stock) newErrors.stock = 'الرجاء إدخال الكمية.';
        if (!form.color_ar || form.color_ar.length === 0) newErrors.color_ar = 'الرجاء أختيار اللون';
        if (!form.size_en || form.size_en.length === 0) newErrors.size_en = 'الرجاء أختيار الحجم';
        if (!form.size_ar || form.size_ar.length === 0) newErrors.size_ar = 'الرجاء أختيار عدد القطع';

        if (!mainImageFile && !existingMainImage) {
            newErrors.image = 'الرجاء اختيار صورة رئيسية للمنتج.';
        }

        const totalImagesCount = existingImages.length + newImageFiles.length;
        if (totalImagesCount > 8) {
            newErrors.images = `إجمالي الصور متعددة هو ${totalImagesCount}، برجاء ألا يتجاوز 8 صور.`;
        }

        if (form.isSale) {
            if (!form.salePrice) newErrors.salePrice = 'الرجاء إدخال السعر بعد الخصم.';
            if (!form.saleExpireDate) newErrors.saleExpireDate = 'الرجاء إدخال تاريخ انتهاء الخصم.';
            setCheckLoading(false);
        }
        if (form.isNew) {
            if (!form.newExpireDate) newErrors.newExpireDate = 'الرجاء إدخال تاريخ انتهاء علامة جديد.';
            setCheckLoading(false);
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            Object.values(newErrors).forEach(msg => toast.error(msg));
            setCheckLoading(false);
            return;
        }

        if (Number(form.price) < Number(form.basePrice)) {
            const confirmSave = window.confirm('سعر البيع أقل من سعر الجملة هل ترغب في الحفظ؟');
            if (!confirmSave) {
                setCheckLoading(false);
                return;
            }
        }
        if (form.isSale && Number(form.salePrice) <= Number(form.basePrice)) {
            const confirmSave = window.confirm('سعر بعد الخصم نفس أو أقل من سعر الجملة. هل ترغب في الحفظ؟');
            if (!confirmSave) {
                setCheckLoading(false);
                return;
            }
        }

        if (form.isSale && Number(form.salePrice) >= Number(form.price)) {
            const confirmSave = window.confirm('سعر بعد الخصم نفس أو أعلى من سعر المنتج. هل ترغب في الحفظ؟');
            if (!confirmSave) {
                setCheckLoading(false);
                return;
            }
        }

        const payload = {
            ...form,
            id: form.id,
            color_ar: form.color_ar || [],
            size_ar: form.size_ar || [],
            size_en: form.size_en || [],
            keywords: form.keywords && typeof form.keywords === 'string' && form.keywords.trim() !== '' ? [form.keywords.trim()] : (Array.isArray(form.keywords) ? form.keywords : []),
            basePrice: form.basePrice === '' ? originalData.current.basePrice : Number(form.basePrice),
            price: form.price === '' ? originalData.current.price : Number(form.price),
            stock: form.stock === '' ? originalData.current.stock : Number(form.stock),
            sold: form.sold === '' ? originalData.current.sold : Number(form.sold),
            salePrice: form.salePrice === '' ? originalData.current.salePrice : Number(form.salePrice),
            isSale: Boolean(form.isSale),
            isNew: Boolean(form.isNew),
            saleExpireDate: form.isSale ? form.saleExpireDate : null,
            newExpireDate: form.isNew ? form.newExpireDate : null,
            parentId: form.parentId || null,
        };

        // تحضير FormData لإرسال البيانات
        const formData = new FormData();
        Object.entries(payload).forEach(([key, val]) => {
            if (key === 'image' || key === 'images') return;
            if (Array.isArray(val)) {
                val.forEach((item) => formData.append(`${key}[]`, item));
            } else {
                if ((key === "saleExpireDate" || key === "newExpireDate") && !val) {
                    return;
                }
                if (val !== null && val !== undefined) {
                    formData.append(key, val);
                }
            }
        });

        // 📸 الصورة الرئيسية: إذا تم اختيار ملف جديد نرسل الملف، وإذا لم تتغير نرسل الرابط الحالي
        if (mainImageFile instanceof File) {
            formData.append('image', mainImageFile);
        } else if (existingMainImage) {
            formData.append('image', existingMainImage);
        }

        // 📸 الصور الإضافية (المعرض): إرسال الملفات الجديدة والصور المحتفظ بها
        newImageFiles.forEach((file) => {
            formData.append('images', file);
        });

        existingImages.forEach((imgUrl) => {
            formData.append('images', imgUrl);
        });

        try {
            await axios.put(`${process.env.REACT_APP_API_URL}/api/v1/products/${form.id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true,
            });

            toast.success('تم تحديث المنتج بنجاح');
            setCheckLoading(false);
            setProducts((prev) =>
                prev.map((p) =>
                    p.id === itemId ? { ...p, ...payload } : p
                )
            );

            setTimeout(() => {
                navigate('/admin/productslist', { state: { updated: true } });
                fetchProducts();
            }, 1500);

        } catch (error) {
            setCheckLoading(false);
            if (error.response?.data?.message === 'Record with this name already exists in one of the languages') {
                toast.error('الاسم مستخدم بالفعل');
                setCheckLoading(false);
            } else {
                setCheckLoading(false);
                toast.error('حدث خطأ أثناء التحديث');
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
        <div className='admin_page' id='addProducts'>
            <div className='admin_page_tabl'>
                <ToastContainer toastClassName="custom-toast" position="top-right" autoClose={1500} />
                <div className='secHead'><h5>تعديل منتج</h5></div>
                <div className='admin_page_tabl_cr'>
                    <ParentPreviow parentId={selectedParent} />

                    <form onSubmit={handleSubmit} className='mainCatForm'>

                        {/* سيليكتور لو المنتج الحالي أساسي → نعرض الأبناء */}
                        {product && (
                            <Select
                                className="selector"
                                options={[
                                    { value: product.id, label: `${product.name_ar || product.name_en} (الأساسي)` },
                                    ...(product.children || []).map(child => ({
                                        value: child.id,
                                        label: child.name_ar || child.name_en
                                    }))
                                ]}
                                value={
                                    form.id
                                        ? {
                                            value: form.id,
                                            label:
                                                form.id === product.id
                                                    ? `${product.name_ar || product.name_en} (الأساسي)`
                                                    : (product.children || []).find(c => c.id === form.id)?.name_ar ||
                                                    (product.children || []).find(c => c.id === form.id)?.name_en ||
                                                    "منتج غير موجود"
                                        }
                                        : null
                                }
                                styles={customStyles}
                                onChange={(selectedOption) => {
                                    setSelectedParent(selectedOption.value);
                                    if (!selectedOption) {
                                        setForm(prev => ({ ...prev, parentId: null, id: null }));
                                        return;
                                    }

                                    if (selectedOption.value === product.id) {
                                        setForm({
                                            ...mapProductToForm(product)
                                        });
                                        setupProductImages(product);
                                    } else {
                                        const child = (product.children || []).find(c => c.id === selectedOption.value);
                                        if (child) {
                                            setForm({
                                                ...mapProductToForm(child),
                                                parentId: product.id
                                            });
                                            setupProductImages(child);
                                        }
                                    }
                                }}
                            />
                        )}

                        <br />
                        <h5><span>بيانات اساسية</span></h5>
                        <div className='addProducts-Org-section'>
                            <div className="addProducts-Org">
                                <label className="lable-col" htmlFor='name_ar'>
                                    اسم المنتج
                                    <input name="name_ar" value={form.name_ar || ''} onChange={handleChange} />
                                    {errors.name_ar && <p className="error-message">* {errors.name_ar}</p>}
                                </label>
                                <label className="lable-col" htmlFor='name_en'>
                                    وصف قصير
                                    <input name="slug" value={form.slug || ''} onChange={handleChange} />
                                    {errors.slug && <p className="error-message">* {errors.slug}</p>}
                                </label>
                            </div>
                            <div className="addProducts-Org">
                                <label className="lable-col" htmlFor='model_ar'>
                                    البراند
                                    <input name="model_ar" value={form.model_ar || ''} onChange={handleChange} />
                                    {errors.model_ar && <p className="error-message">* {errors.model_ar}</p>}
                                </label>

                                <label className="lable-col" htmlFor='model_en'>
                                    المنشأ/الخامة
                                    <input name="model_en" value={form.model_en || ''} onChange={handleChange} />
                                    {errors.model_en && <p className="error-message">* {errors.model_en}</p>}
                                </label>
                            </div>

                            <div className="addProducts-Org">
                                <label className="lable-col" htmlFor='basePrice'>
                                    السعر الأساسي
                                    <input name="basePrice" type="number" value={form.basePrice || ''} onChange={handleChange} />
                                    {errors.basePrice && <p className="error-message">* {errors.basePrice}</p>}
                                </label>

                                <label className="lable-col" htmlFor='price'>
                                    السعر
                                    <input name="price" type="number" value={form.price || ''} onChange={handleChange} />
                                    {errors.price && <p className="error-message">* {errors.price}</p>}
                                </label>
                            </div>
                        </div>

                        <div className="addProducts-Org">
                            <label className="lable-col" htmlFor='stock'>
                                المخزون - المتبقي: {form.stock - form.sold}
                                <input name="stock" type="number" value={form.stock || ''} onChange={handleChange} min="0" />
                                {errors.stock && <p className="error-message">* {errors.stock}</p>}
                            </label>

                            <label className="lable-col" htmlFor="sold">
                                المبيعات
                                <input type="number" name="sold" value={form.sold || ''} onChange={handleChange} min="0" />
                            </label>
                        </div>

                        <div className="addProducts-Org">
                            <label className="lable-col" htmlFor="size_ar">
                                <p>أختر العدد <small> (يمكن ادخال قيمة جديدة) </small></p>
                                <CreatableSelect
                                    className="selector"
                                    name="size_ar"
                                    options={sizeOptions}
                                    value={form.size_ar?.map((v) => ({ value: v, label: v }))}
                                    onChange={(selected) =>
                                        setForm({
                                            ...form,
                                            size_ar: selected ? [selected.value] : [],
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
                                    value={form.size_en?.map((v) => ({ value: v, label: v }))}
                                    onChange={(selected) =>
                                        setForm({
                                            ...form,
                                            size_en: selected ? [selected.value] : [],
                                        })
                                    }
                                    placeholder="اختر الحجم"
                                    isClearable
                                    formatCreateLabel={(inputValue) => `إضافة "${inputValue}"`}
                                    styles={{
                                        input: (base) => ({ ...base, direction: 'rtl' }),
                                        menu: (base) => ({ ...base, direction: 'rtl' }),
                                    }}
                                />
                                {errors.size_en && <p className="error-message">* {errors.size_en}</p>}
                            </label>
                        </div>

                        <label className="lable-col" htmlFor="color_ar">
                            <p>اللون <small>(يمكن ادخال قيمة جديدة)</small></p>
                            <CreatableSelect
                                className="selector"
                                name="color_ar"
                                options={colorOptions}
                                value={form.color_ar?.map((v) => ({ value: v, label: v }))}
                                onChange={(selected) =>
                                    setForm({
                                        ...form,
                                        color_ar: selected ? [selected.value] : [],
                                    })
                                }
                                placeholder="اختر اللون"
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

                        <div className="addProducts-Org">
                            <div className='lable-col'>
                                <strong style={{ paddingBottom: '0.8rem' }}>الوصف</strong>
                                <DescriptionForm name="description_ar" value={form.description_ar || ''} onChange={handleChange} />
                                {errors.description_ar && <p className="error-message">* {errors.description_ar}</p>}
                            </div>
                        </div>
                        <br />
                        <div className="addProducts-Org">
                            <div className='lable-col'>
                                <strong style={{ paddingBottom: '0.8rem' }}>الوصف إضافي + </strong>
                                <DescriptionForm name="description_en" value={form.description_en || ''} onChange={handleChange} />
                                {errors.description_en && <p className="error-message">* {errors.description_en}</p>}
                            </div>
                        </div>
                        <br />
                        <div className='check_sec'>
                            <Switch color="warning"
                                id="isSale"
                                name="isSale"
                                checked={form.isSale || false}
                                onChange={handleChange} />
                            <h5><span>الخصم والعروض</span></h5>
                        </div>
                        <div className='optinalSec'>
                            <div className={`secBlocked ${form.isSale ? 'secUnBlock' : ''}`}> <p>تحديد المنتج في صفحة العروض</p></div>
                            <div className="addProducts-Org">
                                <label className="lable-col" htmlFor="salePrice">
                                    السعر بعد الخصم
                                    <input type="number" name="salePrice" value={form.salePrice || ''} onChange={handleChange} />
                                    {errors.salePrice && <p className="error-message">* {errors.salePrice}</p>}
                                </label>

                                <label className="lable-col" htmlFor="saleExpireDate">
                                    انتهاء الخصم
                                    <input type="date" name="saleExpireDate" value={form.saleExpireDate || ''} onChange={handleChange} />
                                    {errors.saleExpireDate && <p className="error-message">* {errors.saleExpireDate}</p>}
                                </label>
                            </div>
                        </div>

                        <br />
                        <div className='check_sec'>
                            <Switch color="warning"
                                id="isNew"
                                name="isNew"
                                checked={form.isNew || false}
                                onChange={handleChange} />
                            <h5><span>وصل حديثاً</span></h5>
                        </div>
                        <div className='optinalSec'>
                            <div className={`secBlocked ${form.isNew ? 'secUnBlock' : ''}`}> <p>تحديد المنتج في صفحة وصل حديثاً</p> </div>
                            <div className="addProducts-Org">
                                <label className="lable-col" htmlFor="newExpireDate">
                                    انتهاء الجديد
                                    <input type="date" name="newExpireDate" id="newExpireDate" value={form.newExpireDate || ''} onChange={handleChange} />
                                    {errors.newExpireDate && <p className="error-message">* {errors.newExpireDate}</p>}
                                </label>
                            </div>
                        </div>

                        <br />
                        {/* 📸 بطاقة إدارة وتعديل صور المنتج */}
                        <div className="product-card" style={{ gridColumn: '1 / -1' }}>
                            <h5><span>صور المنتج</span></h5>
                            <div className='addProducts-Org-section'>
                                <div className='addProducts-Org'>
                                    {/* الصورة الرئيسية */}
                                    <div className="addImg">
                                        <label htmlFor="mainImg" className="uploadBox">
                                            {mainImagePreview ? (
                                                <>
                                                    <span className="text">تغيير الصورة الرئيسية</span>
                                                    <span className="plus"><LuReplace /></span>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="plus"><FaImage /></span>
                                                    <span className="text">اختر صورة رئيسية</span>
                                                </>
                                            )}
                                            <input type="file" id="mainImg" accept="image/*" hidden onChange={handleMainImageChange} />
                                        </label>
                                        {errors.image && <p className="error-message">* {errors.image}</p>}
                                        {mainImagePreview && (
                                            <div className="image-preview-item main-preview" style={{ marginTop: '15px' }}>
                                                <img src={mainImagePreview} alt="الصورة الرئيسية" />
                                                <span className="img-tag">الصورة الرئيسية</span>
                                                <button
                                                    type="button"
                                                    className="remove-img-btn"
                                                    title="إزالة الصورة الرئيسية"
                                                    onClick={handleRemoveMainImage}
                                                >
                                                    <FaTimes />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* الصور الإضافية المتعددة */}
                                    <div className="addImg">
                                        <label htmlFor="imagesUpload" className="uploadBox">
                                            <span className="plus"><FaImages /></span>
                                            <span className="text">
                                                {existingImages.length + newImagesPreview.length > 0
                                                    ? `إضافة صور أخرى (تم تحديد ${existingImages.length + newImagesPreview.length} صور)`
                                                    : 'اختر صور متعددة للمنتج'}
                                            </span>
                                            <input type="file" id="imagesUpload" accept="image/*" multiple hidden onChange={handleMultipleImagesChange} />
                                        </label>
                                        {errors.images && <p className="error-message">* {errors.images}</p>}

                                        {(existingImages.length > 0 || newImagesPreview.length > 0) && (
                                            <div className="imgBox">
                                                {/* الصور القديمة المحفوظة مسبقاً */}
                                                {existingImages.map((src, idx) => (
                                                    <div key={`existing-${idx}`} className="image-preview-item">
                                                        <img src={src} alt={`محفوظة ${idx + 1}`} />
                                                        <span className="img-tag existing">محفوظة</span>
                                                        <button
                                                            type="button"
                                                            className="remove-img-btn"
                                                            title="حذف هذه الصورة"
                                                            onClick={() => handleRemoveExistingImage(idx)}
                                                        >
                                                            <FaTimes />
                                                        </button>
                                                    </div>
                                                ))}

                                                {/* الصور الجديدة التي تم اختيارها للرفع */}
                                                {newImagesPreview.map((src, idx) => (
                                                    <div key={`new-${idx}`} className="image-preview-item">
                                                        <img src={src} alt={`جديدة ${idx + 1}`} />
                                                        <span className="img-tag new">جديدة +</span>
                                                        <button
                                                            type="button"
                                                            className="remove-img-btn"
                                                            title="إلغاء الصورة الجديدة"
                                                            onClick={() => handleRemoveNewImage(idx)}
                                                        >
                                                            <FaTimes />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <br />
                        <div className='admin-btn-container'>
                            {checkLoading ? (
                                <ThreeDot color="#ff6f33" size="small" text="جاري الحفظ..." textColor="#ff6f33" />
                            ) : (
                                <button type="submit" className='C-btn'>حفظ</button>
                            )}
                            <div className='admin-btn-groub'>
                                <button
                                    type="button"
                                    className="C-btn"
                                    onClick={() => navigate('/admin/productslist')}
                                >
                                    إلغاء
                                </button>
                            </div>
                        </div>
                    </form>

                </div>
            </div>
            <br />
        </div>
    );
};

export default EditProduct;


