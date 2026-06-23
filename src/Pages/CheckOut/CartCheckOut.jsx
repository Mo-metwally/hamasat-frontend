import React, { useEffect, useState, useMemo } from 'react'
import './CheckOut.scss'

import { Link, useNavigate } from 'react-router-dom'

import { getAllGovernorates, getCitiesByGovernorateId } from 'egylist'
import CreatableSelect from 'react-select/creatable';
import Select from 'react-select'
import { FaRegCheckCircle, FaRegCopy } from "react-icons/fa";
import { ToastContainer, toast } from 'react-toastify';
import { LuClipboardCheck } from "react-icons/lu";
import { useCartCheckOut } from '../../Context/cartCheckOutContext';
import { useCart } from '../../Context/CartContext';
import { FourSquare, ThreeDot } from 'react-loading-indicators';
import { useProducts } from '../../hooks/useProducts';
import CheckoutAgreement from './CheckoutAgreement';
import { Helmet } from 'react-helmet-async';

const CartCheckOut = () => {
    const navigate = useNavigate()
    const { cartOrderData, setCartOrderData, placeCartOrder } = useCartCheckOut();
    const { fetchCart } = useCart();
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [orderCode, setOrderCode] = useState("");
    const { products } = useProducts();
    const [governorates, setGovernorates] = useState([]);
    const [cities, setCities] = useState([])
    const [errors, setErrors] = useState({});
    const { cart, loading } = useCart();
    const [checkLoading, setCheckLoading] = useState(false);
    const [agreed, setAgreed] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0)
        if (orderSuccess) {
            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        }
    }, [navigate, orderSuccess])

    // ✅ تجهيز cartItems زي صفحة الكارت
    const cartItems = useMemo(() => {
        if (Array.isArray(cart?.products)) {
            return cart.products.map((item) => ({
                ...item,
                productId: item.id,
                quantity: item.CartProducts?.quantity || 1,
                color: item.color_ar?.[0] || "",
                size: item.size_ar?.[0] || "",
            }));
        }
        return [];
    }, [cart]);

    const productsQuantity = cartItems.length;

    const totalQuantity = useMemo(() => {
        return cartItems.reduce((sum, item) => sum + item.quantity, 0);
    }, [cartItems]);

    const totalProductsPrice = useMemo(() => {
        return cartItems.reduce((total, item) => {
            const productData = products.find(p => p.id === item.productId);
            if (!productData) return total;
            const finalPrice = productData.salePrice > 0 ? productData.salePrice : productData.price;
            return total + (finalPrice * item.quantity);
        }, 0);
    }, [cartItems, products]);

    useEffect(() => {
        const allGovs = getAllGovernorates()

        setGovernorates(
            allGovs.map((g) => ({
                value: g.id,
                label: g.name_ar,
            }))
        )
    }, [])

    const handleGovernorateChange = (selected) => {
        if (selected) {
            setCartOrderData((prev) => ({
                ...prev,
                area: selected.label,
                flatNum: "", // نفرغ المدينة لما المحافظة تتغير
            }));

            let allCities = getCitiesByGovernorateId(selected.value).map((c) => ({
                value: c.id,
                label: c.name_ar,
            }));

            // إضافة مدن الشرقية
            if (selected.label === "الشرقية") {
                const extraCities = [
                    { value: "faqus", label: "فاقوس" },
                    { value: "husseiniya", label: "الحسينية" },
                    { value: "el-hosenia-gdida", label: "الحسنية الجديدة" },
                    { value: "abo-kebir", label: "أبو كبير" },
                    { value: "kafr-sakr", label: "كفر صقر" },
                    { value: "awlad-sakr", label: "أولاد صقر" },
                    { value: "hejaza", label: "هيها" }, // مثال
                ];

                // دمج المدن الأصلية مع الإضافية
                allCities = [...allCities, ...extraCities];
            }

            setCities(allCities);
        } else {
            setCartOrderData((prev) => ({
                ...prev,
                area: "",
                flatNum: "",
            }));
            setCities([]);
        }
    };


    const handleCityChange = (selected) => {
        if (selected) {
            setCartOrderData((prev) => ({
                ...prev,
                flatNum: selected.label
            }));
        } else {
            setCartOrderData((prev) => ({
                ...prev,
                flatNum: ""
            }));
        }
    };
    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // لو رقم الهاتف → نسمح بأرقام بس
        if (name === "phoneNumber") {
            const onlyNums = value.replace(/\D/g, ""); // يمنع أي حروف
            setCartOrderData({ ...cartOrderData, [name]: onlyNums });
        } else {
            setCartOrderData({ ...cartOrderData, [name]: value });
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setCheckLoading(true);

        let newErrors = {};
        if (!cartOrderData.username) newErrors.username = "برجاء إدخال الإسم بالكامل";
        if (!cartOrderData.phoneNumber) {
            newErrors.phoneNumber = "برجاء إدخال رقم الهاتف";
        } else if (!/^01\d{9}$/.test(cartOrderData.phoneNumber)) {
            newErrors.phoneNumber = "برجاء إدخال رقم صحيح";
        }
        if (!cartOrderData.street) newErrors.street = "برجاء إدخال اسم الشارع";
        if (!cartOrderData.address) newErrors.address = "برجاء إدخال العنوان بالتفصيل";
        if (!cartOrderData.buildingNum) newErrors.buildingNum = "برجاء إدخال علامة مميزة";
        if (!cartOrderData.area) newErrors.area = "برجاء إختيار المحافظة";
        if (!cartOrderData.flatNum) newErrors.flatNum = "برجاء إختيار أو كتابة أسم المدينة";
        if (!agreed) {
            newErrors.agreed = "يجب الموافقة على الشروط والسياسات قبل إتمام الطلب";
        }

        // ✅ التحقق من الأخطاء
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setCheckLoading(false);
            Object.values(newErrors).forEach((msg) => toast.error(msg));
            return;
        }

        try {
            // ✅ البيانات التي سيتم إرسالها
            const payload = {
                ...cartOrderData,
                sessionId: cart?.sessionId,
            };

            const res = await placeCartOrder(payload);

            // ✅ تحقق من استجابة صحيحة قبل اظهار رسالة النجاح
            if (res?.data?.orderCode) {
                toast.success("تم تأكيد الطلب بنجاح");
                setOrderCode(res.data.orderCode);
                setOrderSuccess(true);
                setCheckLoading(false);
            } else {
                toast.error("فشل في إتمام الطلب، حاول مرة أخرى");

                navigate("/cart"); // نفذ التنقل قبل أي throw
                setOrderSuccess(false);
                setCheckLoading(false);
                // throw new Error("فشل تأكيد الطلب"); // مش ضروري هنا
            }

        } catch (err) {
            console.error("❌ API Error:", err);
            toast.error("فشل في إتمام الطلب، حاول مرة أخرى");
        } finally {
            setCheckLoading(false);
            setTimeout(() => {
                fetchCart();
            }, 2000);
        }
    };


    const handleCopy = () => {
        if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(orderCode)
                .then(() => toast.success("📋 تم نسخ الكود!"))
                .catch(() => toast.error("⚠️ فشل النسخ!"));
        } else {
            // fallback لو المتصفح مش بيدعم
            const textarea = document.createElement("textarea");
            textarea.value = orderCode;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand("copy");
            document.body.removeChild(textarea);
            toast.success("📋 تم نسخ الكود!");
        }
    };

    useEffect(() => {
        if (orderSuccess) {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    }, [orderSuccess]);

    if (loading) {
        return (
            <div className='loading'>
                <ThreeDot color="#ff6f33" size="medium" />
            </div>
        )
    };

    return (

        <>
            <Helmet>
                {/* Title */}
                <title>تأكيد الطلب - همسات هوم</title>

                {/* Basic Meta */}
                <meta
                    name="description"
                    content="تم تأكيد طلبك بنجاح في معرض همسات هوم. شكراً لتسوقك معنا، سيتم التواصل معك لإتمام عملية التوصيل في أسرع وقت."
                />
                <meta name="keywords" content="همسات, همسات هوم, معرض همسات, تجهيز عرائس, اجهزة كهربائية, مفروشات, ادوات منزلية, ادوات مطبخ, مستلزمات العروسة, ديكورات, اطقم صيني, كاسات, اطقم عشاء, معرض تجهيز عرائس الشرقية, فاقوس, اثاث منزلي, اجهزة منزلية حديثة, اطقم طهي, طاسات جرانيت" />

                <meta name="robots" content="noindex, nofollow" />
                <meta name="googlebot" content="noindex, nofollow" />
                <meta name="bingbot" content="noindex, nofollow" />

                {/* Theme Color */}
                <meta name="theme-color" content="#000000" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

                {/* Open Graph / Facebook / WhatsApp */}
                <meta property="og:type" content="website" />
                <meta property="og:title" content="تأكيد الطلب - معرض همسات للأدوات المنزلية" />
                <meta
                    property="og:description"
                    content="شكراً لتسوقك من معرض همسات هوم. تم تأكيد طلبك وسيتم تجهيز الشحنة الخاصة بك قريباً."
                />
                <meta property="og:image" content="/Hamasat-ShowCase.webp" />
                <meta property="og:url" content={`${process.env.REACT_APP_API_URL}/checkout`} />
                <meta property="og:site_name" content="همسات هوم" />

                {/* Twitter Card */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="تأكيد الطلب - معرض همسات للأدوات المنزلية" />
                <meta
                    name="twitter:description"
                    content="تم تأكيد طلبك بنجاح من معرض همسات هوم. شكراً على ثقتك بنا."
                />
                <meta name="twitter:image" content="/Hamasat-ShowCase.webp" />

                {/* Canonical URL */}
                <link rel="canonical" href={`${process.env.REACT_APP_API_URL}/checkout`} />
            </Helmet>
            <div id='checkOut' className='CartPage'>
                <div className='cartHead'>
                    <h2>تأكيد الطلب <LuClipboardCheck /></h2>
                    <p>عدد المنتجات: <strong>{productsQuantity}</strong></p>
                    <p>إجمالي القطع: <strong>{totalQuantity}</strong></p>
                </div>

                {orderSuccess ? (
                    // ✅ رسالة نجاح
                    <div className="check-sucss">
                        <div className="check-sucss-container">
                            <div className='check-sucss-head'>
                                <FaRegCheckCircle className="success-icon" />
                                <h2>تم تأكيد الطلب بنجاح</h2>
                            </div>
                            <div className="order-id-box">
                                <div className="order-id-content">
                                    <div className="codeBox"> رقم الطلب: <span> {orderCode}</span></div>
                                    <button onClick={handleCopy} title="نسخ الكود">
                                        <FaRegCopy />
                                    </button>
                                </div>
                            </div>
                            {/* 📌 رسالة المتابعة */}
                            <div className="order-track-message">
                                <p>سيتم إرسال رسائل المتابعة إلى البريد الإلكتروني الخاص بك,
                                    <br />
                                    <strong>يمكن متابعة حالة الطلب من خلال صفحة الطلبات</strong>
                                </p>
                                <p>
                                    تابع حالة طلبك بسهولة عبر إدخال رقم الطلب.
                                    <br />
                                    <strong>برجاء التوجه لصفحة الطلبات وإدخال رقم الطلب لمتابعة التحديثات</strong>
                                </p>

                                <Link to="/orders" className="C-btn">
                                    الطلبات
                                </Link>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className='cart-container'>
                        <div className='cartT-container'>
                            {/* ✅ الفورم */}
                            <form className='checkOut-form' onSubmit={handleSubmit}>
                                <div className='CheckForm-items'>
                                    <div className='CheckForm-item'>
                                        <label className="label-text"><span>الأسم كامل</span></label>
                                        <input
                                            type='text'
                                            name='username'
                                            placeholder='أدخل الإسم بالكامل'
                                            value={cartOrderData.username}
                                            onChange={handleInputChange}
                                        />
                                        {errors.username && <span className="error">{errors.username}</span>}
                                    </div>
                                    <div className='CheckForm-item'>
                                        <label className="label-text"><span>رقم الهاتف</span></label>
                                        <input
                                            dir='rtl'
                                            type="tel"
                                            name="phoneNumber"
                                            placeholder="أدخل رقم الهاتف"
                                            maxLength={11}
                                            pattern="[0-9]*"
                                            value={cartOrderData.phoneNumber}
                                            onChange={handleInputChange}
                                        />
                                        {errors.phoneNumber && <span className="error">{errors.phoneNumber}</span>}
                                    </div>
                                </div>

                                <div className='CheckForm-items'>
                                    <div className='CheckForm-item'>
                                        <label className="label-text"><span>البريد الإلكتروني (أختياري)</span></label>
                                        <input
                                            type='email'
                                            name='email'
                                            placeholder='أدخل البريد الإلكتروني'
                                            value={cartOrderData.email}
                                            onChange={handleInputChange}
                                        />
                                        {errors.email && <span className="error">{errors.email}</span>}
                                    </div>
                                    <div className='CheckForm-item'>
                                        <label className="label-text"><span>أختر المحافظة</span></label>
                                        <Select
                                            className='CheckForm-selector'
                                            options={governorates}
                                            placeholder='اختر المحافظة'
                                            onChange={handleGovernorateChange}
                                            isClearable
                                            value={
                                                cartOrderData.area
                                                    ? { label: cartOrderData.area, value: governorates.find((g) => g.label === cartOrderData.area)?.value }
                                                    : null
                                            }
                                            styles={{
                                                singleValue: (provided) => ({
                                                    ...provided,
                                                    color: "#4A1E0A", // لون النص بعد الاختيار
                                                }),
                                                option: (provided, state) => ({
                                                    ...provided,
                                                    backgroundColor: state.isSelected
                                                        ? "#ff4d008a" // selected
                                                        : state.isFocused
                                                            ? "#FFEAE2" // hover
                                                            : "#FFF7EF",
                                                    color: state.isSelected ? "#FFF7EF" : "#4A1E0A",
                                                    cursor: "pointer",
                                                }),
                                                placeholder: (provided) => ({
                                                    ...provided,
                                                    color: "#4a1e0ab9",
                                                }),
                                            }}
                                        />
                                        {errors.area && <span className="error">{errors.area}</span>}
                                    </div>
                                </div>

                                <div className='CheckForm-items'>
                                    <div className='CheckForm-item'>
                                        <label className="label-text"><span>أختر المدينة / المركز</span></label>
                                        <CreatableSelect
                                            className='CheckForm-selector'
                                            options={cities}
                                            placeholder='اختر او أدخل أسم المدينة'
                                            onChange={handleCityChange}
                                            isClearable
                                            isDisabled={!cartOrderData.area}
                                            value={
                                                cartOrderData.flatNum
                                                    ? {
                                                        label: cartOrderData.flatNum,
                                                        value: cities.find((c) => c.label === cartOrderData.flatNum)?.value,
                                                    }
                                                    : null
                                            }
                                            formatCreateLabel={(inputValue) => `إضافة "${inputValue}"`}

                                            styles={{
                                                singleValue: (provided) => ({
                                                    ...provided,
                                                    color: "#4A1E0A", // لون النص بعد الاختيار
                                                }),
                                                option: (provided, state) => ({
                                                    ...provided,
                                                    backgroundColor: state.isSelected
                                                        ? "#ff4d008a" // selected
                                                        : state.isFocused
                                                            ? "#FFEAE2" // hover
                                                            : "#FFF7EF",
                                                    color: state.isSelected ? "#FFF7EF" : "#4A1E0A",
                                                    cursor: "pointer",
                                                }),
                                                placeholder: (provided) => ({
                                                    ...provided,
                                                    color: "#4a1e0ab9",
                                                }),
                                            }}

                                        />
                                        {errors.flatNum && <span className="error">{errors.flatNum}</span>}
                                    </div>
                                    <div className='CheckForm-item'>
                                        <label className="label-text"><span>أسم الشارع</span></label>
                                        <input
                                            type='text'
                                            name='street'
                                            placeholder='أدخل أسم الشارع'
                                            value={cartOrderData.street}
                                            onChange={handleInputChange}
                                        />
                                        {errors.street && <span className="error">{errors.street}</span>}
                                    </div>
                                </div>

                                <div className='CheckForm-items'>
                                    <div className='CheckForm-item'>
                                        <label className="label-text"><span>العنوان مفصل</span></label>
                                        <input
                                            type='text'
                                            name='address'
                                            placeholder='أدخل العنوان مفصل'
                                            value={cartOrderData.address}
                                            onChange={handleInputChange}
                                        />
                                        {errors.address && <span className="error">{errors.address}</span>}
                                    </div>
                                    <div className='CheckForm-item'>
                                        <label className="label-text"><span>علامة مميزة</span></label>
                                        <input
                                            type='text'
                                            name='buildingNum'
                                            placeholder='أدخل علامة مميزة'
                                            value={cartOrderData.buildingNum}
                                            onChange={handleInputChange}
                                        />
                                        {errors.buildingNum && <span className="error">{errors.buildingNum}</span>}
                                    </div>
                                </div>

                                <div className='CheckForm-items'>
                                    <div className='CheckForm-item'>
                                        <label className="label-text"><span>ملاحظات الطلب (أختياري)</span></label>
                                        <textarea
                                            name='userNote'
                                            placeholder='ملاحظات الطلب'
                                            value={cartOrderData.userNote}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>
                                <CheckoutAgreement onAgreementChange={setAgreed} />
                            </form>
                        </div>

                        <div className='cart-check'>
                            <div className='cart-check-items'>
                                {/* ✅ عرض تفاصيل الطلب */}
                                <div className="cart-check-item total-section">
                                    <h4>مصاريف الشحن</h4>
                                    <p>تكلفة الشحن تُحدد بناءً على المنطقة وحجم الطرد أو الطلب.</p>
                                    <p>
                                        <small><span>(سيتم التواصل معكم لإبلاغكم بقيمة الشحن بعد تحديد وزن الطلب وعنوان التوصيل)</span></small>
                                    </p>
                                </div>

                                <div className="cart-check-item info-section">
                                    <div style={{ position: 'relative', paddingBottom: '1rem' }}>
                                        {checkLoading && (<div className="loading">
                                            <FourSquare color={["#FFF7EF"]} />
                                        </div>)}
                                        <h4 className='info-head'>تفاصيل الطلب</h4>
                                        <div style={{ position: 'relative', paddingBottom: '1rem' }}>
                                            <div className="total-row">
                                                <p>عدد المنتجات: <strong>{productsQuantity} منتج</strong></p>
                                            </div>
                                            <div className="total-row">
                                                <p>إجمالي القطع: <strong>{totalQuantity} قطعة</strong></p>
                                            </div>
                                            <div className="total-row grand-total">
                                                <p>
                                                    الإجمالي: <strong>{Number(totalProductsPrice || 0).toLocaleString('en-EG')} ج.م + مصاريف الشحن</strong>
                                                </p>

                                            </div>
                                        </div>
                                        <button className='checkBtn' type='submit' onClick={handleSubmit}>تأكيد الطلب</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <ToastContainer toastClassName="custom-toast" autoClose={1500} />
            </div>
        </>

    )
}

export default CartCheckOut
