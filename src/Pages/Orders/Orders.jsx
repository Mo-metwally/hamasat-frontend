import React, { useEffect, useState } from "react";
import "./Orders.scss";
import { LazyLoadImage } from "react-lazy-load-image-component";
import followUpImg from "../../Assets/OrdersPage.webp";
import { Link } from "react-router-dom";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import CancelOrder from "./CancelOrder";
import { FourSquare } from "react-loading-indicators";
// import { PiPackageBold } from "react-icons/pi";
import { LuPackage, LuPackageCheck, LuPackagePlus, LuPackageX } from "react-icons/lu";
import Pagenation from "../../Components/ProductComponents/pagenation/Pagenation";
import { Helmet } from "react-helmet-async";
import { normalizedText } from "../../utils/normalizeText";


const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);
    const [shouldRender, setShouldRender] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const filterDefualt = ["processed", "pending"];
    const [filter, setFilter] = useState(filterDefualt);
    const ordersPerPage = 3;

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
        window.scrollTo(0, 0);
    }, [currentPage]);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/orders/guest/orders`, {
                    method: "GET",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                });

                if (!res.ok) {
                    const errorData = await res.json();
                    console.error("📌 خطأ من السيرفر:", res.status, errorData);
                    return;
                }

                const data = await res.json();
                const sortedOrders = (data.data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setOrders(sortedOrders);
            } catch (error) {
                console.error("📌 مشكلة في الكود أو الاتصال:", error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const handleToggle = (orderId) => {
        if (expandedId === orderId) {
            setExpandedId(null);
            setTimeout(() => setShouldRender((prev) => ({ ...prev, [orderId]: false })), 300);
        } else {
            setExpandedId(orderId);
            setShouldRender((prev) => ({ ...prev, [orderId]: true }));
        }
    };

    if (loading) {
        return (
            <div className="loading">
                <FourSquare color={["#ff6f33"]} />
            </div>
        );
    }

    // ===== فلترة الطلبات حسب الحالة =====
    // تحديث الفلترة حسب ما إذا كان filter موجود أو لا
    const filteredOrders = filter
        ? orders.filter((order) => filter.includes(order.status))
        : orders;


    const OrdersQuantity = filteredOrders.length;
    const OrdersPicQuantity = filteredOrders.reduce((total, order) => total + (order.products?.length || 0), 0);
    const ProductsPicQuantity = filteredOrders.reduce(
        (total, order) =>
            total + (order.products?.reduce((sum, product) => sum + (product.OrderProducts?.quantity || 0), 0) || 0),
        0
    );

    // ===== Pagination =====
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);

    // داخل المكون
    const getFilterName = () => {
        if (!filter) return (
            <>
                <LuPackage /> <sub><small> الكل </small></sub>
            </>
        );

        // لو filter مصفوفة، نحدد الاسم حسب المحتوى
        if (Array.isArray(filter) && filter.includes("processed") && filter.includes("pending")) {
            return (
                <>
                    <LuPackagePlus /> <sub><small> المنتظرة </small></sub>
                </>
            );
        }

        if (Array.isArray(filter) && filter.includes("shipped")) {
            return (
                <>
                    <LuPackageX /> <sub><small> المشحونة </small></sub>
                </>
            );
        }

        if (Array.isArray(filter) && filter.includes("delivered")) {
            return (
                <>
                    <LuPackageCheck /> <sub><small> المستلمة </small></sub>
                </>
            );
        }

        return (
            <>
                <LuPackage /> <sub><small> الكل </small></sub>
            </>
        );
    };


    return (
        <>
            <Helmet>
                {/* Title */}
                <title>طلباتي - همسات هوم</title>

                {/* Basic Meta */}
                <meta
                    name="description"
                    content="تصفح قائمة طلباتك السابقة والحالية في منصة همسات هوم، وتابع حالة كل طلب بسهولة."
                />
                <meta name="robots" content="noindex, nofollow" />
                <meta name="googlebot" content="noindex, nofollow" />
                <meta name="bingbot" content="noindex, nofollow" />
                <meta name="keywords" content="همسات, همسات هوم, منصة همسات, تجهيز عرائس, اجهزة كهربائية, مفروشات, ادوات منزلية, ادوات مطبخ, مستلزمات العروسة, ديكورات, اطقم صيني, كاسات, اطقم عشاء, معرض تجهيز عرائس الشرقية, فاقوس, اثاث منزلي, اجهزة منزلية حديثة, اطقم طهي, طاسات جرانيت" />

                <link rel="manifest" href="https://hamsathome.com/site.webmanifest" />

                {/* Theme Color */}
                <meta name="theme-color" content="#000000" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

                {/* Open Graph / Facebook / WhatsApp */}
                <meta property="og:type" content="website" />
                <meta property="og:title" content="طلباتي - منصة همسات" />
                <meta
                    property="og:description"
                    content="اعرض جميع طلباتك وتتبع حالتها في منصة همسات هوم لتجهيز المنازل."
                />
                <meta property="og:image" content="/Hamasat-ShowCase.webp" />
                <meta property="og:url" content={`${process.env.REACT_APP_API_URL}/orders`} />
                <meta property="og:site_name" content="همسات هوم" />

                {/* Twitter Card */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="طلباتي - منصة همسات" />
                <meta
                    name="twitter:description"
                    content="تابع حالة طلباتك السابقة والجديدة في منصة همسات هوم بسهولة."
                />
                <meta name="twitter:image" content="/Hamasat-ShowCase.webp" />

                {/* Canonical URL */}
                <link rel="canonical" href={`${process.env.REACT_APP_API_URL}/orders`} />
            </Helmet>


            <div id="Orders">
                <div className="cartHead cartHead-wrapper">
                    <div>
                        <h2>
                            الطلبات {orders.length >= 1 ? (getFilterName()) : (<><LuPackage /> <sub><small> لا يوجد </small></sub></>)}
                        </h2>
                    </div>
                    <div className="cartHead-wrapper-left">
                        <p>عدد الطلبات: <strong>{OrdersQuantity}</strong></p>
                        {orders.length >= 1 && (<p>إجمالي المنتجات: <strong>{OrdersPicQuantity}</strong></p>)}
                        {orders.length >= 1 && (<p>إجمالي عدد القطع: <strong>{ProductsPicQuantity}</strong></p>)}
                    </div>
                </div>

                {/* // ===== فلترة الطلبات حسب الحالة ===== */}


                {/* // ===== أزرار الفلترة ===== */}
                {orders.length >= 1 && (
                    <div className="cartHead">
                        <button
                            className={`sortBtn ${Array.isArray(filter) && filter.includes("processed") && filter.includes("pending") ? "sortSelected" : ""
                                }`}
                            onClick={() => setFilter(["processed", "pending"])}
                        >
                            الطلبات المنتظرة
                        </button>

                        <button
                            className={`sortBtn ${Array.isArray(filter) && filter.includes("shipped") && filter.length === 1 ? "sortSelected" : ""}`}
                            onClick={() => setFilter(["shipped"])}
                        >
                            الطلبات المشحونة
                        </button>

                        <button
                            className={`sortBtn ${Array.isArray(filter) && filter.includes("delivered") ? "sortSelected" : ""}`}
                            onClick={() => setFilter(["delivered"])}
                        >
                            الطلبات المستلمة
                        </button>

                        <button
                            className={`sortBtn ${!filter ? "sortSelected" : ""}`}
                            onClick={() => setFilter(null)}
                        >
                            كل الطلبات
                        </button>

                    </div>

                )}

                {filteredOrders.length === 0 ? (
                    <div id="FollowUp">
                        <div className="FollowUp-Container">
                            <div className="FollowUp-Img">
                                <LazyLoadImage src={followUpImg} alt="FollowUpImage" effect="blur" />
                            </div>
                            <div className="FollowUp-Content-container">
                                <div className="FollowUp-Content">
                                    <div className="lineUp"></div>
                                    <h2><strong>الطلبات</strong></h2>
                                    <p>
                                        لا يمكن العثور علي بيانات طلباتك في الوقت الحالي، برجاء أستخدام كود <br /> الطلب الخاص بك في صفحة{" "}
                                        <Link className="followupLink" to="/followup">تابع طلب</Link> لمتابعة طلبك.
                                    </p>
                                </div>
                                <div>
                                    <Link className="C-btn" to="/followup">تابع طلبك</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    currentOrders.map((order) => {
                        const isExpanded = expandedId === order.id;
                        return (
                            <div key={order.id} className="order-card">
                                <div className={`order-header ${isExpanded ? "expanded" : ""}`} onClick={() => handleToggle(order.id)}>
                                    <div className="order-header-col1">
                                        <h6><small>تاريخ الطلب:</small> {new Date(order.createdAt).toLocaleDateString()}</h6>
                                        <h6>
                                            <small>إجمالي السعر:</small> {Number(order.total || 0).toLocaleString('en-EG')} ج.م
                                        </h6>

                                        <h6><small>الإسم:</small> {order.username}</h6>
                                        <h6><small>كود التتبع:</small> {order.orderCode}</h6>
                                    </div>
                                    <div className="order-header-col2">
                                        {order.status === "pending" && order.adminMessage ? (
                                            <h6 className="delayedT">
                                                <strong>حالة الطلب:</strong>{" "}
                                                معلق للتأكيد  <span className="highLigt"> - {normalizedText(order.adminMessage)}</span>
                                            </h6>
                                        ) : (
                                            <h6>
                                                <strong>حالة الطلب:</strong>{" "}
                                                {getStatusMessage(order.status)} {order.status === "delivered" && (<span> - {order.adminNoteTwo}</span>)} {order.status !== "delivered" && order.adminMessage && (<span className="highLigt"> - {normalizedText(order.adminMessage)}</span>)}
                                            </h6>
                                        )}
                                        <p>
                                            تفصيل الطلب
                                            <strong>{isExpanded ? <IoIosArrowUp /> : <IoIosArrowDown />}</strong>
                                        </p>
                                    </div>
                                </div>

                                {shouldRender[order.id] && (
                                    <div className={`order-extra ${isExpanded ? "open" : "close"}`}>
                                        <h6 className="extra-status">
                                            <small>الحالة: </small> {getStatusMessage(order.status)}
                                            {order.message && (<strong> - <small>{order.message || "لا يوجد"}</small></strong>)}
                                            {order.adminMessage && (<strong className="highLigt"> - <small>{normalizedText(order.adminMessage) || "لا يوجد"}</small></strong>)}
                                        </h6>
                                        <h6><small>الإيميل:</small> {order.email}</h6>
                                        <h6><small>المنطقة:</small> {order.area} - {order.flatNum}</h6>
                                        <h6><small>العنوان:</small> {order.address}</h6>
                                        {order.userNote && <h6><small>ملاحظة الطلب:</small> {order.userNote || "لا يوجد"}</h6>}
                                    </div>
                                )}

                                <div className="order-items">
                                    {(order.products || []).map((product, i) => (
                                        <div key={i} className="order-item">
                                            <img src={product.image} alt={product.nameAr} />
                                            <div className="item-info">
                                                <h4>{product.nameAr}</h4>
                                                <p><strong>أسم المنتج:</strong> {product?.name_ar}</p>
                                                <p><strong>الكمية:</strong> {product?.OrderProducts.quantity}</p>
                                                <p><strong>اللون:</strong> {product?.color_ar}</p>
                                                <p><strong>عدد القطع:</strong> {product?.OrderProducts.color}</p>
                                                <p><strong>الحجم:</strong> {product?.OrderProducts.size}</p>
                                                <p>
                                                    <strong>السعر:</strong> {Number(product?.OrderProducts.unitPrice || 0).toLocaleString('en-EG')} ج.م
                                                </p>

                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="order-footer">
                                    <Link className="C-btn" to={`/followup?code=${order.orderCode}`}>تتبع الطلب</Link>
                                    {!["shipped", "delivered", "returned", "canceled"].includes(order.status) && (
                                        <CancelOrder orderDetails={{ ...order }} />
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}

                <Pagenation totalPages={totalPages} currentPage={currentPage} onPageChange={setCurrentPage} />
            </div>
        </>
    );
};

export default Orders;
