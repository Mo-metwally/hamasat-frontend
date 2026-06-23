import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./InvoicePage.scss";
import { useHandleOrders } from "../../../Context/HandleOrders";
import { AdminOrdersContext } from "../../../Context/AdminOrdersContext";
import { toast, ToastContainer } from "react-toastify";
import OrderMenu from "../OrdersTable/OrderMenu";
import ShippingCostModal from "../OrdersTable/ShippingCostModal";
import { ThreeDot } from "react-loading-indicators";
import { VscDebugReverseContinue } from "react-icons/vsc";
// import SendToStorage from "./SendToStorage";
import CancelReasonModal from "../OrdersTable/CancelReasonModal";
import { Helmet } from "react-helmet-async";
import CopyOrder from "./CopyOrder";
import { normalizedText } from "../../../utils/normalizeText";
import { useAuth } from "../../../Context/AuthContext";
import VendorContactModal from "./VendorContactModal";
import EditOrderProductModal from "./EditOrderProductModal";
import AddOrderProductModal from "./AddOrderProductModal";
import axios from "axios";
import { FaEdit, FaTrash } from "react-icons/fa";
const getVendorPhone = (order, currentUser) => {
    const productWithVendor = order?.products?.find(p => p.vendor?.phone);
    if (productWithVendor?.vendor?.phone) {
        return productWithVendor.vendor.phone;
    }
    if (currentUser?.role === 'admin' && currentUser?.phone) {
        return currentUser.phone;
    }
    return "+201026388831";
};

const formatPhoneLink = (phone) => {
    if (!phone) return "tel:+201026388831";
    let cleaned = phone.replace(/[\s\-\(\)]/g, '');
    if (cleaned.startsWith('0') && cleaned.length === 11) {
        return `tel:+20${cleaned.substring(1)}`;
    }
    if (!cleaned.startsWith('+')) {
        return `tel:+${cleaned}`;
    }
    return `tel:${cleaned}`;
};

const formatPhoneDisplay = (phone) => {
    if (!phone) return "+20 10 2638 8831";
    let cleaned = phone.replace(/[\s\-\(\)]/g, '');
    if (cleaned.startsWith('0') && cleaned.length === 11) {
        return `+20 ${cleaned.substring(1, 4)} ${cleaned.substring(4, 8)} ${cleaned.substring(8)}`;
    }
    if (cleaned.startsWith('+20') && cleaned.length === 13) {
        return `+20 ${cleaned.substring(3, 6)} ${cleaned.substring(6, 10)} ${cleaned.substring(10)}`;
    }
    return phone;
};


const InvoicePage = () => {
    const { orderId } = useParams();
    const { orderDetails, fetchOrderDetails, updateLocalOrderStatus } = useContext(AdminOrdersContext);
    const { updateOrderStatus, updateAdminNoteOne, updateAdminNoteTwo, sendEmailToCustomer } = useHandleOrders();
    const [cancelOrderId, setCancelOrderId] = useState(null);
    const { user } = useAuth();

    const [currentOrderData, setCurrentOrderData] = useState({ cost: "", paymentStatus: "" });
    const [currentCancelData, setCurrentCancelData] = useState({ cancelReason: "" });
    const [loading, setLoading] = useState(true);
    const [nextStatus, setNextStatus] = useState(null);
    const [selectedOrderId, setSelectedOrderId] = useState(null);

    // Vendor Contact Modal State
    const [vendorModalOpen, setVendorModalOpen] = useState(false);
    const [selectedVendorProduct, setSelectedVendorProduct] = useState(null);

    // Order Modification Modals State
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [selectedEditProduct, setSelectedEditProduct] = useState(null);

    const navigate = useNavigate();


    const statusMap = {
        all: "الكل",
        pending: "طلب جديد",
        processed: "قيد التنفيذ",
        shipped: "تم الشحن",
        delivered: "تم التسليم",
        returned: "تم الإرجاع",
        canceled: "تم الإلغاء",
    };

    const order = orderDetails[orderId];
    const handlePrint = () => {
        navigate("/admin/orders/print-invoice", { state: { order } });
    };

    useEffect(() => {
        if (!order) {
            // لو مش متخزن في الكونتكست هاته من السيرفر
            fetchOrderDetails(orderId).finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [orderId, order, fetchOrderDetails]);

    const handleDeleteProduct = async (productId) => {
        if (!window.confirm("هل أنت متأكد من إزالة هذا المنتج من الطلب؟ سيتم استرجاع رصيده للمخزن.")) return;
        try {
            setLoading(true);
            const res = await axios.delete(`${process.env.REACT_APP_API_URL}/api/v1/orders/${order.id}/products/${productId}`, { withCredentials: true });
            if (res.status === 200) {
                toast.success("تم حذف المنتج بنجاح ✅");
                fetchOrderDetails(orderId);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "حدث خطأ أثناء الحذف ❌");
        } finally {
            setLoading(false);
        }
    };

    // تغيير الحالة العادية
    const handleChangeStatus = async (orderId, newStatus, currentStatus, orderDetails) => {
        if (!orderId) return;
        if (!newStatus || newStatus === currentStatus) return;


        try {
            setLoading(true);

            if (
                currentStatus === "pending" &&
                newStatus !== "pending" &&
                newStatus !== "canceled" &&
                newStatus !== "delayed"
            ) {
                setSelectedOrderId(orderId);
                setNextStatus(newStatus);
            } else if (newStatus === "delivered") {
                await updateOrderStatus(orderId, newStatus);
                updateLocalOrderStatus(orderId, newStatus);

                // ✅ تحديث حالة الدفع
                await updateAdminNoteTwo(orderId, "تم الدفع");

            } else if (newStatus === "returned") {

                await updateOrderStatus(orderId, newStatus);
                updateLocalOrderStatus(orderId, newStatus);

                // ✅ عدل حالة الدفع
                await sendEmailToCustomer(orderId, "تم الإرجاع ")
                await updateAdminNoteTwo(orderId, "مرتجع");

            } else if (newStatus === "delayed") {
                await updateAdminNoteTwo(orderId, "معلق");
                const vPhone = getVendorPhone(order, user);
                const telLink = formatPhoneLink(vPhone);
                const telDisplay = formatPhoneDisplay(vPhone);
                await sendEmailToCustomer(
                    orderId,
                    `
تم تعليق طلبك رقم: (${order.orderCode}) نظراً لعدم امكانية التواصل،
<br />
سيتم التواصل معك مرة أخرى خلال 48 ساعة.
<br />
يمكنك التواصل معنا من خلال الرقم:
<a href='${telLink}'
style='direction:ltr; unicode-bidi:bidi-override;'>
${telDisplay}
</a>
  `
                );

            } else if (newStatus === "canceled") {
                // 👇 هنا بدلاً من التحديث المباشر
                setCancelOrderId(orderId); // يفتح مودال سبب الإلغاء
                setNextStatus(newStatus);  // نحفظ الحالة اللي جاية
            }
            else {
                await updateOrderStatus(orderId, newStatus);
                updateLocalOrderStatus(orderId, newStatus);

                toast.success(`تم تحديث حالة الطلب إلى "${statusMap[newStatus]}" بنجاح`);
            }
        } catch (err) {
            toast.error("حدث خطأ أثناء تحديث الحالة");
            console.log(err.message);
        } finally {
            setLoading(false);
            fetchOrderDetails(orderId);
        }
    };

    const handleSaveShippingCost = async (orderId, { cost, paymentStatus }) => {
        if (!orderId) return;
        const numericCost = Number(cost);
        const totalPrice = numericCost + Number(order.total || 0);

        if (isNaN(numericCost) || numericCost < 1) {
            toast.error("من فضلك أدخل مصاريف شحن صحيحة أكبر من صفر");
            setSelectedOrderId(null);
            setNextStatus(null);
            return;
        }

        try {
            setLoading(true);

            await updateAdminNoteOne(orderId, numericCost);
            await updateAdminNoteTwo(orderId, paymentStatus);

            if (nextStatus) {
                await updateOrderStatus(orderId, nextStatus);
                updateLocalOrderStatus(orderId, nextStatus, numericCost);
                await sendEmailToCustomer(
                    orderId,
                    `
    تم التواصل وتأكيد الطلب بنجاح.<br />
    مصاريف الشحن: ${numericCost} جنيه.<br />
    إجمالي سعر الطلب: ${totalPrice} جنيه.<br />
    شكرًا لتعاونكم.
  `)
                toast.success(
                    `تم نقل الطلب إلى "${statusMap[nextStatus]}" وحفظ مصاريف الشحن وحالة الدفع`
                );
            }

            setSelectedOrderId(null);
            setNextStatus(null);

        } catch (err) {
            toast.error("حدث خطأ أثناء حفظ مصاريف الشحن وحالة الدفع");
            console.log(err.message);
        } finally {
            setLoading(false);
            fetchOrderDetails(orderId);
        }
    };

    // تسلسل الحالات حسب الزر "متابعة"
    const handleSequentialStatus = async (order) => {
        const currentStatus = order.status;

        try {
            setLoading(true);

            if (currentStatus === "pending") {
                setSelectedOrderId(order.id);
                setNextStatus("processed");

            } else if (currentStatus === "processed") {
                await updateOrderStatus(order.id, "shipped");
                updateLocalOrderStatus(order.id, "shipped");
                toast.success("تم نقل الطلب إلى الشحن بنجاح");
            } else if (currentStatus === "shipped") {
                await updateOrderStatus(order.id, "delivered");
                updateLocalOrderStatus(order.id, "delivered");

                // ✅ تحديث حالة الدفع
                await updateAdminNoteTwo(order.id, "تم الدفع");

                toast.success("تم تسليم الطلب بنجاح، وتم تحديث حالة الدفع إلى تم الدفع");
            }
        } catch (err) {
            toast.error("حدث خطأ أثناء تحديث الحالة");
            console.log(err.message);
        } finally {
            setLoading(false);
            fetchOrderDetails(orderId);
        }
    };

    const handleSaveCancelReason = async (orderId, reason) => {
        if (!orderId || !reason) return;

        try {
            setLoading(true);

            // 📝 احفظ السبب
            await sendEmailToCustomer(orderId, reason);

            // 📝 عدّل حالة الطلب للإلغاء
            if (nextStatus === "canceled") {
                await updateOrderStatus(orderId, "canceled");
                updateLocalOrderStatus(orderId, "canceled");

                // ✅ عدل حالة الدفع
                await updateAdminNoteTwo(orderId, "تم الإلغاء");

                toast.success(
                    `تم إلغاء الطلب (${reason}) وتحديث حالة الدفع إلى "تم الإلغاء"`
                );
            }

            // reset
            setCancelOrderId(null);
            setNextStatus(null);
        } catch (err) {
            toast.error("حدث خطأ أثناء حفظ سبب الإلغاء");
            console.log(err.message);
        } finally {
            setLoading(false);
            fetchOrderDetails(orderId);
        }
    };

    const handleDelayedOrder = async (order) => {
        if (!order?.id || !order.orderCode) {
            toast.error("حدث خطأ أثناء تأجيل الطلب, برجاء تحديث الصفحة");
            return
        };

        try {
            setLoading(true);

            const vPhone = getVendorPhone(order, user);
            const telLink = formatPhoneLink(vPhone);
            const telDisplay = formatPhoneDisplay(vPhone);

            await sendEmailToCustomer(
                order.id,
                `
تم تعليق طلبك رقم: (${order.orderCode}) نظراً لعدم امكانية التواصل،
<br />
سيتم التواصل معك مرة أخرى خلال 48 ساعة.
<br />
يمكنك التواصل معنا من خلال الرقم:
<a href='${telLink}'
style='direction:ltr; unicode-bidi:bidi-override;'>
${telDisplay}
</a>
  `
            );

            await updateAdminNoteTwo(order.id, "معلق");
            toast.success("تم تعليق الطلب بنجاح");
        } catch (err) {
            toast.error("حدث خطأ أثناء حفظ تأجيل الطلب");
        } finally {
            setLoading(false);
            fetchOrderDetails(order.id);
        }
    };


    if (!order) return <div className="error-text">❌ الطلب غير موجود</div>;

    return (
        <>
            <Helmet>
                <title>فاتورة - {order.username} - {order.orderCode}</title>
                <meta
                    name="description"
                    content="عرض تفاصيل فاتورة الطلب المحدد في متجر همسات هوم."
                />
                <meta name="robots" content="noindex, nofollow" />
                <link rel="canonical" href={`${process.env.REACT_APP_API_URL}/admin/orders/invoice/:orderId`} />
            </Helmet>

            <div className="invoice-container">

                {/* Header */}
                <div className="invoice-header">
                    {loading && (
                        <div className='loading'>
                            <ThreeDot color="#ff6f33" size="medium" />
                        </div>
                    )}
                    <div>
                        <h2 className="invoice-title">طلب رقم: {order.orderCode}</h2>
                        <p className="invoice-date">
                            تاريخ الإنشاء:{" "}
                            <strong>{new Date(order.createdAt).toLocaleDateString("ar-EG")}</strong>
                        </p>
                    </div>
                    <div className="invoice-options" >
                        <OrderMenu
                            order={order}
                            pageStatus={order.status}
                            handleChangeStatus={(newStatus) =>
                                handleChangeStatus(order.id, newStatus, order.status)
                            }
                        />

                        <p>
                            حالة الطلب:{" "}
                            {order.adminNoteTwo && order.status === "pending" ? (
                                <span className={`status-badge status-${order.status} delayed`}>
                                    معلق
                                </span>

                            ) : (
                                <span className={`status-badge status-${order.status}`}>
                                    {statusMap[order.status] || order.status}
                                </span>
                            )}
                        </p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="actions">
                    <button type='button' className="btn btn-print" onClick={handlePrint}>
                        طباعة
                    </button>
                    <CopyOrder orderDetails={order} user={user} />
                    <button
                        type='button'
                        className="btn btn-payment"
                        onClick={() => {
                            setSelectedOrderId(order.id);
                            setCurrentOrderData({
                                cost: order.adminNoteOne,
                                paymentStatus: order.adminNoteTwo,
                            });
                        }}
                    >
                        حالة الدفع
                    </button>
                    {order.status === "delivered" &&
                        <button
                            type='button'
                            className="btn btn-return"
                            onClick={() => {
                                setCancelOrderId(order.id);
                                setCurrentCancelData({
                                    cancelReason: order.adminMessage
                                })
                            }}
                        >
                            مراجعة مرتجع
                        </button>}

                    {order.status === "pending" && !order.adminNoteTwo && (
                        <button
                            type="button"
                            className="btn btn-delayed"
                            onClick={() => {
                                if (window.confirm(`هل أنت متأكد من تعليق الطلب رقم ${order.orderCode}؟`)) {
                                    handleDelayedOrder(order);
                                }
                            }}
                        >
                            تعليق الطلب
                        </button>
                    )}

                    {(order.status === "pending" || order.status === "processed" || order.status === "shipped") && (
                        <button type='button' className={`continueBtn ${order.status}`} onClick={() => handleSequentialStatus(order)}>
                            {order.status === "pending" && (<span>تنفيذ </span>)}
                            {order.status === "processed" && (<span>شحن </span>)}
                            {order.status === "shipped" && (<span>تم التسليم </span>)}
                            <VscDebugReverseContinue />
                        </button>
                    )}
                </div>

                {/* Main Grid */}
                <div className="invoice-grid">
                    {/* Products Container */}
                    <div className="products-section">
                        {/* Products */}
                        <div className="card card-products">
                            <div className="card-header ">
                                <h3 className="card-title">{user?.role === 'admin' ? 'المنتجات الخاصة بك' : 'المنتجات'}</h3>
                                <p>عدد المنتجات: <strong className="highLigt">{user?.role === 'admin' ? order.products.filter(p => p.vendorId === user.id).length : order.products.length}</strong></p>
                            </div>
                            <div className="card-content products-list">
                                {loading && (
                                    <div className='loading'>
                                        <ThreeDot color="#ff6f33" size="medium" />
                                    </div>
                                )}
                                {order.products && order.products.length > 0 ? (
                                    (user?.role === 'admin' ? order.products.filter(p => p.vendorId === user.id) : order.products).map((product, idx) => (
                                        <div key={idx} className="product-item">
                                            <div className="product-info">
                                                <img
                                                    src={
                                                        product.image ||
                                                        "/no-image.png"
                                                    }
                                                    alt={product.name_ar}
                                                    className="product-img"
                                                />
                                                <div>
                                                    <h6 className="product-name">
                                                        {product.name_ar}
                                                    </h6>
                                                    {user?.role === 'superAdmin' && (
                                                        <p
                                                            className="product-qty"
                                                            style={{ color: '#ff6f33', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}
                                                            onClick={() => {
                                                                if (product.vendor) {
                                                                    setSelectedVendorProduct(product);
                                                                    setVendorModalOpen(true);
                                                                }
                                                            }}
                                                        >
                                                            البائع: {product.vendor ? product.vendor.name : 'معرض همسات هوم'}
                                                        </p>
                                                    )}
                                                    <p className="product-qty">
                                                        الكمية:{" "}
                                                        {product.OrderProducts.quantity} × {" "}
                                                        {Math.floor(Number(product.OrderProducts.unitPrice || 0)).toLocaleString('en-EG')} ج.م

                                                    </p>
                                                    <p className="product-qty">
                                                        اللون:{" "}
                                                        {
                                                            product.color_ar[0]
                                                        }
                                                    </p>
                                                    {product.OrderProducts.color !== "n/a" && (<p className="product-qty">
                                                        عدد القطع:{" "}
                                                        {
                                                            product.OrderProducts
                                                                .color
                                                        } / {' '}
                                                        {product.OrderProducts.size !== "n/a" && <span>
                                                            الحجم:{" "}
                                                            {
                                                                product.OrderProducts
                                                                    .size
                                                            }
                                                        </span>}
                                                    </p>)}

                                                </div>
                                            </div>
                                            <div className="product-price" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                                                <span>{Math.floor(Number(product.OrderProducts.total || 0)).toLocaleString('en-EG')} ج.م</span>
                                                {(user?.role === 'superAdmin' || user?.role === 'admin') && (
                                                    <div className="btn-modern-group">
                                                        <button
                                                            onClick={() => { setSelectedEditProduct(product); setEditModalOpen(true); }}
                                                            className="btn-modern btn-modern-edit"
                                                            title="تعديل المنتج"
                                                        >
                                                            <svg viewBox="0 0 512 512"><path d="M471.6 21.7c-21.9-21.9-57.3-21.9-79.2 0L362.3 51.7l97.9 97.9 30.1-30.1c21.9-21.9 21.9-57.3 0-79.2L471.6 21.7zm-299.2 220c-6.1 6.1-10.8 13.6-13.5 21.9l-29.6 88.8c-2.9 8.6-.6 18.1 5.8 24.6s15.9 8.7 24.6 5.8l88.8-29.6c8.2-2.7 15.7-7.4 21.9-13.5L437.7 172.3 339.7 74.3 172.4 241.7zM96 64C43 64 0 107 0 160V416c0 53 43 96 96 96H352c53 0 96-43 96-96V320c0-17.7-14.3-32-32-32s-32 14.3-32 32v96c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V160c0-17.7 14.3-32 32-32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H96z"/></svg>
                                                            <span>تعديل</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteProduct(product.id)}
                                                            className="btn-modern btn-modern-delete"
                                                            title="إزالة المنتج"
                                                        >
                                                            <svg viewBox="0 0 448 512"><path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z"/></svg>
                                                            <span>إزالة</span>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p>لا توجد منتجات في هذا الطلب</p>
                                )}

                                {(user?.role === 'superAdmin' || user?.role === 'admin') && (
                                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                                        <button
                                            onClick={() => navigate("/")}
                                            className="btn-modern btn-modern-add"
                                        >
                                            <svg viewBox="0 0 448 512"><path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"/></svg>
                                            <span>إضافة منتج للطلب من الرئيسية</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Other Products for Admin */}
                        {user?.role === 'admin' && order.products && order.products.filter(p => p.vendorId !== user.id).length > 0 && (
                            <div className="card card-products" style={{ marginTop: '20px' }}>
                                <div className="card-header ">
                                    <h3 className="card-title">منتجات أخرى</h3>
                                    <p>عدد المنتجات: <strong className="highLigt">{order.products.filter(p => p.vendorId !== user.id).length}</strong></p>
                                </div>
                                <div className="card-content products-list">
                                    {order.products.filter(p => p.vendorId !== user.id).map((product, idx) => (
                                        <div key={`other-${idx}`} className="product-item">
                                            <div className="product-info">
                                                <img
                                                    src={product.image || "/no-image.png"}
                                                    alt={product.name_ar}
                                                    className="product-img"
                                                />
                                                <div>
                                                    <h6 className="product-name">{product.name_ar}</h6>
                                                    <p
                                                        className="product-qty"
                                                        style={{ color: '#ff6f33', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}
                                                        onClick={() => {
                                                            if (product.vendor) {
                                                                setSelectedVendorProduct(product);
                                                                setVendorModalOpen(true);
                                                            }
                                                        }}
                                                    >
                                                        البائع: {product.vendor ? product.vendor.name : 'معرض همسات هوم'}
                                                    </p>
                                                    <p className="product-qty">
                                                        الكمية: {product.OrderProducts.quantity} × {Math.floor(Number(product.OrderProducts.unitPrice || 0)).toLocaleString('en-EG')} ج.م
                                                    </p>
                                                    <p className="product-qty">اللون: {product.color_ar[0]}</p>
                                                    {product.OrderProducts.color !== "n/a" && (
                                                        <p className="product-qty">
                                                            عدد القطع: {product.OrderProducts.color} / {' '}
                                                            {product.OrderProducts.size !== "n/a" && <span>الحجم: {product.OrderProducts.size}</span>}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="product-price" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                                                <span>{Math.floor(Number(product.OrderProducts.total || 0)).toLocaleString('en-EG')} ج.م</span>
                                                {user?.role === 'superAdmin' && (
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <button
                                                            onClick={() => { setSelectedEditProduct(product); setEditModalOpen(true); }}
                                                            style={{ background: '#ffc107', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                                                        >
                                                            <FaEdit /> تعديل
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteProduct(product.id)}
                                                            style={{ background: '#dc3545', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                                                        >
                                                            <FaTrash /> إزالة
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Order Details */}
                    <div className="card card-details">
                        <div className="card-header">
                            <h3 className="card-title">تفاصيل الطلب</h3>
                        </div>
                        <div className="card-content">
                            {loading && (
                                <div className='loading'>
                                    <ThreeDot color="#ff6f33" size="medium" />
                                </div>
                            )}
                            <ul className="details-list">
                                <li>
                                    سعر الطلب: <strong className="highLigt">{Math.floor(Number(order.total || 0)).toLocaleString('en-EG')}</strong> ج.م
                                </li>
                                <li>
                                    مصاريف الشحن: <strong className="highLigt">
                                        {order.adminNoteOne ? Number(order.adminNoteOne).toLocaleString('en-EG') : "لم تحدد"}
                                    </strong> {order.adminNoteOne && "ج.م"}
                                </li>
                                <li>
                                    إجمالي: <strong className="highLigt">
                                        {(Math.floor(Number(order.total || 0)) + (Number(order.adminNoteOne) || 0)).toLocaleString('en-EG')}
                                    </strong> ج.م
                                </li>

                                <li>
                                    الحالة:{" "}
                                    {order.adminNoteTwo && order.status === "pending" ? (
                                        <span className={`status-badge status-${order.status} delayed`}>
                                            معلق
                                        </span>

                                    ) : (
                                        <span className={`status-badge status-${order.status}`}>
                                            {statusMap[order.status] || order.status}
                                        </span>
                                    )}

                                </li>
                                <li>حالة الدفع: <strong className="highLigt">{order.adminNoteTwo || "لم تحدد"}</strong></li>
                                <li>
                                    آخر تحديث:{" "}
                                    {new Date(
                                        order.updatedAt
                                    ).toLocaleDateString("ar-EG")}
                                </li>
                                {order.adminMessage && order.status === "canceled" ? (
                                    <li>سبب الإلغاء: <strong className="highLigt">{normalizedText(order.adminMessage) || "لا يوجد"}</strong></li>
                                ) : (
                                    <li>تقرير الطلب: <strong className="highLigt">{normalizedText(order.adminMessage) || "لا يوجد"}</strong></li>
                                )}
                                <li>رسالة السرفر: <strong className="highLigt">{order.message || "لا يوجد"}</strong></li>
                            </ul>
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div className="card card-customer">
                        <div className="card-header">
                            <h3 className="card-title">بيانات العميل</h3>
                        </div>
                        <div className="card-content">
                            {loading && (
                                <div className='loading'>
                                    <ThreeDot color="#ff6f33" size="medium" />
                                </div>
                            )}
                            <ul className="details-list">
                                <li>الاسم: <strong>{order.username}</strong></li>
                                <li>الهاتف: <strong>{order.phoneNumber}</strong></li>
                                <li>الإيميل: <strong>{order.email}</strong></li>
                            </ul>
                        </div>
                    </div>

                    {/* Address */}
                    <div className="card card-address">
                        <div className="card-header">
                            <h3 className="card-title">العنوان</h3>
                        </div>
                        <div className="card-content">
                            {loading && (
                                <div className='loading'>
                                    <ThreeDot color="#ff6f33" size="medium" />
                                </div>
                            )}
                            <p>المحافظة/المدينة: <strong>{order.area} - {order.flatNum}</strong></p>
                            <p>العنوان مفصل: <strong>{order.address}</strong></p>
                            <p>علامة مميزة: <strong>{order.buildingNum}</strong></p>
                            {order.userNote && (<li>
                                ملاحظة العميل: <span className="highLigt">{order.userNote}</span>
                            </li>)}
                        </div>
                    </div>
                </div>

                <ShippingCostModal
                    orderId={selectedOrderId}
                    isOpen={!!selectedOrderId}
                    initialData={currentOrderData}
                    onClose={() => {
                        setSelectedOrderId(null);
                        toast.error("تم الإلغاء");
                    }}
                    onSave={handleSaveShippingCost}
                />

                <CancelReasonModal
                    currentStatus={order.status}
                    orderId={cancelOrderId}
                    isOpen={!!cancelOrderId}
                    initialData={currentCancelData}   // ✅ مرر الداتا هنا
                    onClose={() => {
                        setCancelOrderId(null);
                        toast.error("تم الإلغاء");
                    }}
                    onSave={handleSaveCancelReason}
                />

                <VendorContactModal
                    open={vendorModalOpen}
                    handleClose={() => setVendorModalOpen(false)}
                    product={selectedVendorProduct}
                    orderCode={order.orderCode}
                />

                <EditOrderProductModal
                    open={editModalOpen}
                    handleClose={() => setEditModalOpen(false)}
                    orderId={order.id}
                    product={selectedEditProduct}
                    onSuccess={() => fetchOrderDetails(orderId)}
                />

                <ToastContainer position="top-right" toastClassName="custom-toast" autoClose={3000} />
            </div>
        </>
    );
};

export default InvoicePage;
