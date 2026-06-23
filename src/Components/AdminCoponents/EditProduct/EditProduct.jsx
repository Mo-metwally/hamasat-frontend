import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import CreatableSelect from 'react-select/creatable';
import Switch from '@mui/material/Switch';
import DescriptionForm from '../DescriptionForm/DescriptionForm';

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

    // جلب المنتج الأساسي عند فتح الصفحة
    useEffect(() => {
        const loadProduct = async () => {
            await fetchProducts(); // لو fetchProducts ترجع المنتجات
            await handleProductLoad(product || []); // اعمل default لمصفوفة فاضية
        };
        setSelectedParent(itemId)
        const handleProductLoad = async (productsList) => {
            const prod = Array.isArray(productsList)
                ? productsList.find((p) => p.id === itemId)
                : productsList; // لو جاي كائن واحد من axios
            if (prod) {
                setProduct(prod);
                originalData.current = prod;
                setForm(mapProductToForm(prod));
            } else {
                try {
                    const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/products/${itemId}`);
                    const fetchedProduct = data?.data;
                    if (fetchedProduct) {
                        setProduct(fetchedProduct);
                        originalData.current = fetchedProduct;
                        setForm(mapProductToForm(fetchedProduct));
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
        id: product.id, // ✅ لازم يتضاف
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setCheckLoading(true);
        const payload = {
            ...form,
            id: form.id, // 👈 هي دي اللي هتتغير حسب اختيار الـ Select
            color_ar: form.color_ar || [],
            size_ar: form.size_ar || [],
            size_en: form.size_en || [],
            keywords: form.keywords && form.keywords.trim() !== '' ? [form.keywords.trim()] : [],
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

        try {
            await axios.put(`${process.env.REACT_APP_API_URL}/api/v1/products/${form.id}`, payload, {
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
                                    { value: product.id, label: `${product.name_ar || product.name_en} (الأساسي)` }, // المنتج الأب مع كلمة الأساسي
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
                                        // لو الأب
                                        setForm({
                                            ...mapProductToForm(product) // جلب بيانات الأب كاملة
                                        });
                                    } else {
                                        // لو ابن
                                        const child = (product.children || []).find(c => c.id === selectedOption.value);
                                        if (child) {
                                            setForm({
                                                ...mapProductToForm(child),
                                                parentId: product.id // تأكد من حفظ parentId
                                            });
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
                                placeholder="ادخل كلمات دلالية"
                            />
                        </label> */}
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
                        <div className='admin-btn-container'>

                            {checkLoading ? (

                                <ThreeDot color="#ff6f33" size="small" text="جاري الحفظ..." textColor="#ff6f33" />
                            ) :
                                (
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


