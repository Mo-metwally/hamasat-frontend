import React, { useState, useEffect, useRef } from 'react'
import './TrackOrder.scss'
import { MdTrackChanges } from "react-icons/md";
import { IoIosArrowUp, IoIosArrowDown } from "react-icons/io";
import { LazyLoadImage } from 'react-lazy-load-image-component'
import followUpImg from "../../Assets/OrdersPage.webp";
import CancelOrder from '../Orders/CancelOrder';
import { FourSquare, Riple } from 'react-loading-indicators';
import { toast, ToastContainer } from 'react-toastify';
import { Link } from 'react-router-dom';
import StatusIndicator from './StatusIndicator';
import { Helmet } from 'react-helmet-async';
import { normalizedText } from '../../utils/normalizeText';

const TrackOrder = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const codeFromQuery = urlParams.get("code") || "";
    const [orderCode, setOrderCode] = useState(codeFromQuery);
    const [orderData, setOrderData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showLoading, setShowLoading] = useState(false);
    const [error, setError] = useState("");
    const [isExpanded, setIsExpanded] = useState({});
    const [shouldRender, setShouldRender] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const inputRef = useRef(null);

    const ProductsPicQuantity = orderData?.products?.reduce(
        (sum, product) => sum + (product.OrderProducts?.quantity || 0),
        0
    ) || 0;

    const handleSubmit = async () => {
        if (orderCode.trim() === "") {
            setError("من فضلك أدخل كود الطلب الخاص بك");
            toast.error("من فضلك أدخل كود الطلب الخاص بك");
            return;
        }

        setLoading(true);
        setError("");
        setOrderData(null);

        try {

            const codeRes = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/orders/order/code/${orderCode}`);
            if (!codeRes.ok) {
                const msg = "كود الطلب غير صحيح \n برجاء التأكد من الكود";
                setError(msg);
                setTimeout(() => toast.error(msg), 700);
                return;
            }
            const codeData = await codeRes.json();
            const orderId = codeData.data.id;

            const orderRes = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/orders/order/${orderId}`);
            if (!orderRes.ok) {
                const msg = "حدث خطأ أثناء جلب بيانات الطلب";
                setError(msg);
                setTimeout(() => toast.error(msg), 700);
                return;
            }
            const orderDetails = await orderRes.json();

            setOrderData(orderDetails.data);

        } catch (err) {

            console.error(err);
            setError("حدث خطأ غير متوقع");
            toast.error("حدث خطأ غير متوقع");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (loading) {
            setShowLoading(true);
        } else {
            const timer = setTimeout(() => setShowLoading(false), 800);
            return () => clearTimeout(timer);
        }
    }, [loading]);


    const handleKeyPress = (e) => {
        if (e.key === "Enter") handleSubmit();
    };

    const handleToggle = (id) => {
        setIsExpanded(prev => ({ ...prev, [id]: !prev[id] }));
        setShouldRender(prev => ({ ...prev, [id]: true }));
    };

    const statusMessages = {
        pending: { message: "تم استلام طلبك بنجاح وسوف يتم التواصل معك قريبًا للتأكيد", color: "#FF4B00" },
        processed: { message: "جار التجهيز", color: "#FF4B00" },
        shipped: { message: "تم شحن", color: "#FF4B00" },
        delivered: { message: "تم التوصيل", color: "#22c55e" },
        canceled: { message: "تم الإلغاء", color: "#ef4444" },
        returned: { message: "مرتجع", color: "#6b7280" },
    };

    const getStatusMessage = (status) => {
        const { message, color } = statusMessages[status] || { message: "حالة غير معروفة", color: "#ef4444" };
        return <span style={{ color }}>{message}</span>;
    };

    useEffect(() => {
        if (codeFromQuery) {
            handleSubmit();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [codeFromQuery]);


    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        if (orderData) {
            const timer = setTimeout(() => setIsLoading(false), 800);
            return () => clearTimeout(timer);
        }
    }, [orderData]);

    return (
        <>
            <Helmet>
                {/* Title */}
                <title>تتبع الطلب - همسات هوم</title>

                {/* Basic Meta */}
                <meta
                    name="description"
                    content=" تتبع  طلباتك السابقة والحالية في معرض همسات هوم، وتابع حالة كل طلب بسهولة."
                />
                <meta name="robots" content="index, follow" />
                <link rel="manifest" href="https://hamsathome.com/site.webmanifest" />

                {/* Theme Color */}
                <meta name="theme-color" content="#000000" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

                {/* Open Graph / Facebook / WhatsApp */}
                <meta property="og:type" content="website" />
                <meta property="og:title" content="تتبع الطلب - معرض همسات للأدوات المنزلية" />
                <meta
                    property="og:description"
                    content="اعرض جميع طلباتك وتتبع حالتها في معرض همسات هوم للأدوات المنزلية."
                />
                <meta property="og:image" content="/Hamasat-ShowCase.webp" />
                <meta property="og:url" content={`${process.env.REACT_APP_API_URL}/followup`} />
                <meta property="og:site_name" content="همسات هوم" />

                {/* Twitter Card */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="تتبع الطلب - معرض همسات للأدوات المنزلية" />
                <meta
                    name="twitter:description"
                    content="تابع حالة طلباتك السابقة والجديدة في معرض همسات هوم بسهولة."
                />
                <meta name="twitter:image" content="/Hamasat-ShowCase.webp" />

                {/* Canonical URL */}
                <link rel="canonical" href={`${process.env.REACT_APP_API_URL}/followup`} />
            </Helmet>

            <div id='TrackOrder'>
                {!orderData && (
                    <div id="FollowUp">
                        <div className="FollowUp-Container">
                            <div className="FollowUp-Img">
                                <LazyLoadImage src={followUpImg} alt="FollowUpImage" effect="blur" />
                            </div>
                            <div className="FollowUp-Content-container">
                                <div className="FollowUp-Content">
                                    <div className="lineUp"></div>
                                    <h2>
                                        <strong>تابع طلبك بسهولة</strong>
                                    </h2>

                                    <>
                                        <div className='FollowUp-Content2'>
                                            <p>
                                                أدخل كود طلبك لتتبع حالته وتفاصيله مباشرة على الموقع.
                                                <br />
                                                يمكنك التوجة لصفحة الطلبات للوصول الي كل طلباتك <Link className="followupLink" to="/orders">صفحة الطلبات</Link>
                                                <br />
                                                <small>ستصلك إشعارات التحديث عبر بريدك الإلكتروني دائمًا.</small>
                                            </p>


                                            {showLoading ? (
                                                <div style={{ textAlign: 'center' }}>
                                                    <Riple color={["#ff6f33"]} />
                                                </div>
                                            ) : (
                                                <div className="orderCodeInput-container"
                                                    onClick={() => inputRef.current && inputRef.current.focus()}
                                                >
                                                    <input
                                                        type="text"
                                                        placeholder="أدخل كود الطلب"
                                                        value={orderCode}
                                                        onChange={(e) => setOrderCode(e.target.value)}
                                                        className="orderCodeInput"
                                                        onKeyDown={handleKeyPress}
                                                    />
                                                    <button
                                                        className="C-btn"
                                                        onClick={handleSubmit}
                                                    >
                                                        تابع طلبك
                                                    </button>
                                                </div>
                                            )}
                                            {!showLoading && error && <p className="error-message"><small>{error}</small></p>}

                                        </div>
                                    </>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {orderCode && orderData && (
                    <div className='CartPage' id='OrderDataSec'>

                        <div className='cartHead cartHead-wrapper'>
                            <div>
                                <h2>كود الطلب: {orderCode} <MdTrackChanges /> </h2>
                            </div>
                            <div className="cartHead-wrapper-left">
                                <p>عدد منتجات الطلب: <strong>{orderData.products.length}</strong> منتج</p>
                                <p>عدد قطع الطلب: <strong>{ProductsPicQuantity}</strong> منتج</p>
                            </div>
                        </div>

                        <StatusIndicator status={orderData.status} />

                        <div className="cart-container">
                            <div className="order-card" style={{ position: 'relative' }}>
                                {isLoading && (
                                    <div className='loading'>
                                        <FourSquare color={["#ff6f33"]} />
                                    </div>
                                )}
                                <div className={`order-header ${isExpanded[orderData.id] ? "expanded" : ""}`} onClick={() => handleToggle(orderData.id)}>
                                    <div className='order-header-Items'>
                                        <div className="order-header-col1">
                                            <h6><small>تاريخ الطلب:</small> {new Date(orderData.createdAt).toLocaleDateString()}</h6>
                                            <h6><small>إجمالي السعر:</small> {Number(orderData.total || 0).toLocaleString('en-EG')} ج.م</h6>
                                            <h6><small>الإسم:</small> {orderData.username}</h6>
                                            <h6><small>كود التتبع:</small> {orderData.orderCode}</h6>
                                        </div>
                                        <div className="order-header-col2">
                                            <p>
                                                <span>تفصيل الطلب</span>
                                                <strong>{isExpanded[orderData.id] ? <IoIosArrowUp /> : <IoIosArrowDown />}</strong>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="order-header-col2">
                                        {orderData.status === "pending" && orderData.adminMessage ? (
                                            <h6 className="delayedT">
                                                <strong>حالة الطلب:</strong>{" "}
                                                معلق للتأكيد  <span className="highLigt"> - {normalizedText(orderData.adminMessage)}</span>
                                            </h6>
                                        ) : (
                                            <h6>
                                                <strong>حالة الطلب:</strong>{" "}
                                                {getStatusMessage(orderData.status)} {orderData.status === "delivered" && (<span> - {orderData.adminNoteTwo}</span>)} {orderData.status !== "delivered" && orderData.adminMessage && (<span className="highLigt"> - {normalizedText(orderData.adminMessage)}</span>)}
                                            </h6>
                                        )}
                                    </div>
                                </div>

                                {shouldRender[orderData.id] && (
                                    <div className={`order-extra ${isExpanded[orderData.id] ? "open" : "close"}`}>
                                        <h6><small>الإيميل:</small> {orderData.email}</h6>
                                        {orderData.userNote && <h6><small>ملاحظة الطلب:</small> {orderData.userNote || "لا يوجد"}</h6>}
                                        {/* {orderData.adminMessage && <h5><small>ملاحظة الإدارة:</small> {orderData.adminMessage || "لا يوجد"}</h5>} */}
                                        <h6>
                                            ملاحظة الإدارة:{' '}
                                            {orderData.message && (<strong><small>{orderData.message || "لا يوجد"}</small></strong>)}
                                            {orderData.status === "delivered" && (<strong><small>{orderData.adminNoteTwo}</small></strong>)}
                                            {orderData.adminMessage && (<strong className="highLigt"><small>{normalizedText(orderData.adminMessage) || "لا يوجد"}</small></strong>)}
                                        </h6>
                                    </div>
                                )}

                                <div className="order-items" >
                                    {(orderData.products || []).map((product, i) => (
                                        <div key={i} className="order-item">
                                            <img src={product.image} alt={product.nameAr} />
                                            <div className="item-info">
                                                <h4>{product.nameAr}</h4>
                                                <p><strong>أسم المنتج:</strong> {product?.name_ar}</p>
                                                <p>
                                                    <strong>الكمية:</strong> {Number(product?.OrderProducts.quantity || 0)} × {Math.floor(Number(product?.OrderProducts.unitPrice || 0)).toLocaleString('en-EG')} ج.م
                                                </p>

                                                <p><strong>اللون:</strong> {product?.color_ar}</p>
                                                <p><strong>عدد القطع:</strong> {product?.OrderProducts.color}</p>
                                                <p><strong>الحجم:</strong> {product?.OrderProducts.size}</p>
                                                <p>
                                                    <strong>السعر:</strong> {Math.floor(Number(product?.OrderProducts.total || 0)).toLocaleString('en-EG')} ج.م
                                                </p>

                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>


                            <div className="cart-check">
                                <div className="cart-check-items" style={{ position: "relative" }}>
                                    {isLoading && (
                                        <div className='loading'>
                                            <FourSquare color={["#ff6f33"]} />
                                        </div>
                                    )}
                                    {orderData.adminNoteOne ? (
                                        <div className='cart-check-item'>
                                            <h4>تفاصيل الطلب</h4>
                                        </div>
                                    ) : (
                                        <div className="cart-check-item total-section">
                                            <h4>مصاريف الشحن</h4>
                                            <p>سيتم التواصل معكم لتأكيد الطلب ومصاريف الشحن</p>
                                            <p>
                                                <small><span>(سيتم يتم تحديد مصاريف الشحن في حالة استكمال الطلب)</span></small>
                                            </p>
                                        </div>)}

                                    <div className="cart-check-item adress-section" style={{ position: "relative" }}>
                                        <h5>عنوان الطلب</h5>
                                        <div className="total-row">
                                        </div>
                                        <div className="total-row">
                                            <h6>المنطقة: <small>{orderData.area} - {orderData.flatNum}</small></h6>
                                        </div>
                                        <div className="total-row">
                                            <h6>العنوان: <small>{orderData.address}</small></h6>
                                        </div>
                                        <div className="total-row">
                                            {orderData.userNote && <h6><small>ملاحظة الطلب:</small> {orderData.userNote || "لا يوجد"}</h6>}
                                        </div>
                                    </div>

                                    <div className="cart-check-item info-section">

                                        <h5>الفاتور:</h5>
                                        <div className="total-row">
                                            <h6>عدد المنتجات: <small>{orderData.products.length}</small></h6>
                                        </div>
                                        <div className="total-row">
                                            <h6>عدد القطع: <small>{ProductsPicQuantity}</small></h6>
                                        </div>
                                        <div className="total-row">
                                            <h6>
                                                <small>سعر الطلب:</small> {Number(orderData.total || 0).toLocaleString('en-EG') || "لم تحدد"} ج.م
                                            </h6>

                                            <h6>
                                                <small>مصاريف الشحن:</small> {orderData.adminNoteOne
                                                    ? Number(orderData.adminNoteOne).toLocaleString('en-EG') + " ج.م"
                                                    : "لم تحدد"}
                                            </h6>

                                            <h6>
                                                <small>حالة الدفع:</small> {orderData.adminNoteTwo || "لم تحدد"}
                                            </h6>

                                            <h5>
                                                <small>إجمالي الفاتورة:</small>{" "}
                                                {(Number(orderData.total || 0) + Number(orderData.adminNoteOne || 0)).toLocaleString('en-EG')} ج.م
                                            </h5>
                                        </div>

                                        {!["shipped", "delivered", "returned", "canceled"].includes(orderData.status) && (
                                            <CancelOrder orderDetails={{ ...orderData }} />
                                        )}

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

export default TrackOrder
