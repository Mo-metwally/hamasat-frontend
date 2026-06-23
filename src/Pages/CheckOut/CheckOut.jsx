import React, { useEffect, useState } from 'react'
import './CheckOut.scss'
import { useOrderNow } from '../../Context/OrderNowContext'
import { Link, useNavigate } from 'react-router-dom'
import { getAllGovernorates, getCitiesByGovernorateId } from 'egylist'
import CreatableSelect from 'react-select/creatable';
import Select from 'react-select'
import { FaRegCheckCircle, FaRegCopy } from "react-icons/fa";
import { ToastContainer, toast } from 'react-toastify';
import { LuClipboardCheck } from "react-icons/lu";
import { useCart } from '../../Context/CartContext'
import { useProducts } from '../../hooks/useProducts'
import CheckoutAgreement from './CheckoutAgreement'
import { Helmet } from 'react-helmet-async'
import { FourSquare } from 'react-loading-indicators'



const CheckOut = () => {
    const { orderData, setUserDetails, placeOrder } = useOrderNow()
    const { fetchCart } = useCart();
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [orderCode, setOrderCode] = useState("");
    const { products } = useProducts();
    const navigate = useNavigate()
    const [governorates, setGovernorates] = useState([])
    const [cities, setCities] = useState([])
    const [errors, setErrors] = useState({});
    const [agreed, setAgreed] = useState(false);
    const [checkLoading, setCheckLoading] = useState(false);



    useEffect(() => {
        const allGovs = getAllGovernorates()

        setGovernorates(
            allGovs.map((g) => ({
                value: g.id,
                label: g.name_ar,
            }))
        )
    }, [])

    // console.log("check:", orderData)
    const handleGovernorateChange = (selected) => {
        if (selected) {
            setUserDetails({ area: selected.label });
            let allCities = getCitiesByGovernorateId(selected.value).map((c) => ({
                value: c.id,
                label: c.name_ar,
            }));

            // ✅ لو الشرقية (id = 19 غالبًا في egylist)
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
            setUserDetails({ flatNum: "" });
        } else {
            setUserDetails({ area: "" });
            setCities([]);
        }
    };

    const handleCityChange = (selected) => {
        if (selected) {
            setUserDetails({ flatNum: selected.label })
        } else {
            setUserDetails({ flatNum: '' })
        }
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // لو رقم الهاتف → نسمح بأرقام بس
        if (name === "phoneNumber") {
            const onlyNums = value.replace(/\D/g, ""); // يمنع أي حروف
            setUserDetails({ ...orderData, [name]: onlyNums });
        } else {
            setUserDetails({ ...orderData, [name]: value });
        }
    };


    const productData = products.find(p => p.id === orderData.productId);

    useEffect(() => {
        window.scrollTo(0, 0);

        if (!orderData.productId || !productData) {
            navigate("/shop");
        }
    }, [orderData.productId, navigate, productData]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setCheckLoading(true);

        let newErrors = {};

        // التحقق من صحة البيانات المدخلة
        if (!orderData.username) newErrors.username = "برجاء إدخال الإسم بالكامل";
        if (!orderData.phoneNumber) {
            newErrors.phoneNumber = "برجاء إدخال رقم الهاتف";
        } else if (!/^01\d{9}$/.test(orderData.phoneNumber)) {
            newErrors.phoneNumber = "برجاء إدخال رقم صحيح";
        }
        if (!orderData.street) newErrors.street = "برجاء إدخال اسم المنطقة";
        if (!orderData.address) newErrors.address = "برجاء إدخال العنوان بالتفصيل";
        if (!orderData.buildingNum) newErrors.buildingNum = "برجاء إدخال اسم علامة مميزة";
        if (!orderData.area) newErrors.area = "برجاء إختيار المحافظة";
        if (!orderData.flatNum) newErrors.flatNum = "برجاء إختيار او كتابة أسم المدينة";
        if (!agreed) {
            newErrors.agreed = "يجب الموافقة على الشروط والسياسات قبل إتمام الطلب";
        }
        // ✅ الأول نرجع الأخطاء
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setCheckLoading(false);
            // لف على كل error واظهره في toast
            Object.values(newErrors).forEach((errorMsg) => {
                toast.error(errorMsg);
            });
            return;
        }

        // ✅ بعد التأكد إن مفيش أخطاء، نعمل لوجيك الإيميل
        if (!orderData.email) {
            setUserDetails({ ...orderData, email: "usermail@usermaile.com" });

            const confirmed = window.confirm(
                "⚠️ في حالة عدم وجود بريد إلكتروني لن نتمكن من إرسال رسائل المتابعة. يمكن فقط المتابعة من الموقع."
            );

            if (!confirmed) {
                return; // يوقف العملية لو المستخدم رفض
            }
        } else {
            const confirmed = window.confirm(
                `هل بريدك "${orderData.email}" صحيح؟\nسيتم إرسال رسالة متابعة بحالة الطلب على هذا البريد.\nهل تريد المتابعة؟`
            );
            if (!confirmed) return;
        }

        try {
            const res = await placeOrder();
            if (Number(productData.remaining) === 0) {
                toast.warn("نأسف لنفاذ الكمية");

            } else if (Number(orderData.quantity) > Number(productData.remaining)) {
                toast.warn(`نأسف لنفاذ الكمية \n الكمية المتاحة ${productData.remaining} `);

            } else if (res.data?.status === "fail" || res.data?.success === false) {

                const errorMsg = res.data?.message || "فشل في تأكيد الطلب";
                throw new Error(errorMsg);
            } else {
                setOrderSuccess(true);
                setOrderCode(res.data.orderCode);
                toast.success("تم تأكيد الطلب بنجاح");
            }

        } catch (err) {
            console.error("❌ Error:", err);
            const errorMsg = err?.response?.data?.message || err.message;
            console.log(errorMsg)
            toast.error("فشل في إتمام الطلب، حاول مرة أخرى");

            setOrderSuccess(false);
        } finally {
            setCheckLoading(false);
            // استدعاء fetchCart بعد التأكد من نجاح الطلب
            setTimeout(() => {
                fetchCart();
            }, 2000);
            fetchCart();
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
        const handleBeforeUnload = (event) => {
            event.preventDefault();
            event.returnValue = "⚠️ هل أنت متأكد أنك تريد إعادة تحميل الصفحة أو مغادرتها؟";
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, []);

    useEffect(() => {
        if (!productData) return; // لو المنتج لسه مش موجود متعملش حاجة

        if (orderSuccess) {
            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        }

        if (Number(orderData.quantity) > Number(productData.remaining)) {
            toast.warn(
                `نأسف لنفاذ الكمية \n الكمية المتاحة ${productData.remaining} `,
                {
                    autoClose: 2000,
                    position: "top-right",
                }
            );

            setTimeout(() => {
                navigate("/shop");
            }, 2500);
        }
    }, [orderSuccess, orderData.quantity, productData, navigate]); // ✅ هنا بقى productData مش .remaining


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
                <meta name="robots" content="noindex, nofollow" />
                <meta name="googlebot" content="noindex, nofollow" />
                <meta name="bingbot" content="noindex, nofollow" />

                <meta name="keywords" content="همسات, همسات هوم, معرض همسات, تجهيز عرائس, اجهزة كهربائية, مفروشات, ادوات منزلية, ادوات مطبخ, مستلزمات العروسة, ديكورات, اطقم صيني, كاسات, اطقم عشاء, معرض تجهيز عرائس الشرقية, فاقوس, اثاث منزلي, اجهزة منزلية حديثة, اطقم طهي, طاسات جرانيت" />
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
                    <h2>تأكيد الطلب <LuClipboardCheck /> </h2>
                    <p>عدد قطع الطلب: <strong>{orderData.quantity}</strong> قطعة</p>
                    <p>عدد منتجات الطلب: <strong>1</strong> منتج</p>
                </div>
                {orderSuccess ? (
                    <div className="check-sucss">
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

                    </div>
                ) : (
                    <div className='cart-container'>
                        <div className='cartT-container'>
                            <form className='checkOut-form' onSubmit={handleSubmit}>
                                <div className='CheckForm-items'>
                                    <div className='CheckForm-item'>
                                        <label className="label-text">
                                            <span >الأسم كامل</span>
                                        </label>
                                        <input
                                            type='text'
                                            name='username'
                                            placeholder='أدخل الإسم بالكامل'
                                            value={orderData.username}
                                            onChange={handleInputChange}
                                        />
                                        {errors.username && <span className="error">{errors.username}</span>}
                                    </div>
                                    <div className='CheckForm-item'>
                                        <label className="label-text">
                                            <span className="label-text">رقم الهاتف</span>
                                        </label>
                                        <input
                                            dir='rtl'
                                            type="tel"
                                            name="phoneNumber"
                                            placeholder="أدخل رقم الهاتف"
                                            maxLength={11}
                                            pattern="[0-9]*"
                                            value={orderData.phoneNumber}
                                            onChange={handleInputChange}
                                        />
                                        {errors.phoneNumber && <span className="error">{errors.phoneNumber}</span>}

                                    </div>
                                </div>

                                <div className='CheckForm-items'>
                                    <div className='CheckForm-item'>
                                        <label className="label-text">
                                            <span className="label-text">البريد الإلكتروني (أختياري)</span>
                                        </label>
                                        <input
                                            type='email'
                                            name='email'
                                            placeholder='أدخل البريد الإلكتروني'
                                            value={orderData.email}
                                            onChange={handleInputChange}
                                        />
                                        {errors.email && <span className="error">{errors.email}</span>}
                                    </div>
                                    <div className='CheckForm-item'>
                                        <label className="label-text">
                                            <span className="label-text">أختر المحافظة</span>
                                        </label>
                                        <Select
                                            className='CheckForm-selector'
                                            options={governorates}
                                            placeholder='اختر المحافظة'
                                            onChange={handleGovernorateChange}
                                            isClearable
                                            value={
                                                orderData.area
                                                    ? { label: orderData.area, value: governorates.find((g) => g.label === orderData.area)?.value }
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
                                        <label className="label-text">
                                            <span className="label-text">أختر المدينة / المركز</span>
                                        </label>
                                        <CreatableSelect
                                            className='CheckForm-selector'
                                            options={cities}
                                            placeholder='اختر او أدخل أسم المدينة'
                                            onChange={handleCityChange}
                                            isClearable
                                            isDisabled={!orderData.area}
                                            value={
                                                orderData.flatNum
                                                    ? {
                                                        label: orderData.flatNum,
                                                        value: cities.find((c) => c.label === orderData.flatNum)?.value,
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
                                        <label className="label-text">
                                            <span className="label-text">أسم الشارع</span>
                                        </label>
                                        <input
                                            type='text'
                                            name='street'
                                            placeholder='أدخل أسم الشارع'
                                            value={orderData.street}
                                            onChange={handleInputChange}
                                        />
                                        {errors.street && <span className="error">{errors.street}</span>}
                                    </div>
                                </div>
                                <div className='CheckForm-items'>
                                    <div className='CheckForm-item'>
                                        <label className="label-text">
                                            <span className="label-text">العنوان مفصل</span>
                                        </label>
                                        <input
                                            type='text'
                                            name='address'
                                            placeholder='أدخل العنوان مفصل'
                                            value={orderData.address}
                                            onChange={handleInputChange}
                                        />
                                        {errors.address && <span className="error">{errors.address}</span>}
                                    </div>

                                    <div className='CheckForm-item'>
                                        <label className="label-text">
                                            <span className="label-text">علامة مميزة <small> (أسم أقرب معلم: اسم محل, صيدالية..)</small></span>
                                        </label>
                                        <input
                                            type='text'
                                            name='buildingNum'
                                            placeholder='أدخل علامة مميزة'
                                            value={orderData.buildingNum}
                                            onChange={handleInputChange}
                                        />
                                        {errors.buildingNum && <span className="error">{errors.buildingNum}</span>}
                                    </div>
                                </div>
                                <div className='CheckForm-items'>

                                    <div className='CheckForm-item'>
                                        <label className="label-text">
                                            <span className="label-text">ملاحظات الطلب (أختياري)</span>
                                        </label>
                                        <textarea
                                            name='userNote'
                                            placeholder='ملاحظات الطلب'
                                            value={orderData.userNote}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>
                                <CheckoutAgreement onAgreementChange={setAgreed} />
                            </form>
                        </div>

                        <div className='cart-check '>
                            <h4>تفاصيل الطلب</h4>
                            <div className='cart-check-items'>
                                <div className='cart-check-itemsCard'>
                                    <div>
                                        <img src={productData?.image || null} alt="img" />
                                    </div>
                                    <div className='cart-check-itemsCard-content'>
                                        <p>{productData?.name_ar || "—"}</p>
                                        <p>اللون: {Array.isArray(productData?.color_ar) ? productData.color_ar[0] : productData?.color_ar || ""}</p>
                                        <p>القطع: {Array.isArray(productData?.size_ar) && productData.size_ar.length > 0 ? productData.size_ar[0] : ""}</p>
                                        <p>المقاس: {Array.isArray(productData?.size_en) && productData.size_en.length > 0 ? productData.size_en[0] : ""}</p>

                                    </div>
                                </div>


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

                                        <div className="total-row">
                                            <p>سعر المنتج: <span>
                                                {productData
                                                    ? Number(productData.salePrice) > 0
                                                        ? Number(productData.salePrice).toLocaleString('en-EG')
                                                        : Number(productData.price).toLocaleString('en-EG')
                                                    : "-"} ج.م
                                            </span></p>
                                        </div>

                                        <h5>الكمية: <strong>{Number(orderData.quantity || 0)}</strong></h5>

                                        <div className="total-row">
                                            <p>مصاريف الشحن: <span><strong>حسب الوزن</strong></span></p>
                                        </div>

                                        <div className="total-row grand-total">
                                            <p>الإجمالي: <strong>
                                                {productData
                                                    ? Number(productData.salePrice) > 0
                                                        ? (Number(productData.salePrice) * Number(orderData.quantity || 0)).toLocaleString('en-EG')
                                                        : (Number(productData.price) * Number(orderData.quantity || 0)).toLocaleString('en-EG')
                                                    : "-"} ج.م + مصاريف الشحن
                                            </strong></p>
                                        </div>

                                    </div>
                                    <button className='checkBtn' onClick={handleSubmit} type='submit'>تأكيد الطلب</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <ToastContainer toastClassName="custom-toast" autoClose={1500} />
        </>
    )
}

export default CheckOut
