import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import React, { useState, useMemo, useContext, useEffect } from "react";
import "./OrdersTable.scss";
import { Link, useNavigate } from "react-router-dom";
import AdminOrderPagination from "./AdminOrderPagination";
import ShippingCostModal from "./ShippingCostModal";
import { useHandleOrders } from "../../../Context/HandleOrders";
import OrderMenu from "./OrderMenu";
import { VscDebugReverseContinue } from "react-icons/vsc";
import { IoOpenOutline } from "react-icons/io5";
import { AdminOrdersContext } from "../../../Context/AdminOrdersContext";
import { ThreeDot } from 'react-loading-indicators';
import { LuRefreshCw } from "react-icons/lu";
import CancelReasonModal from './CancelReasonModal';
import { normalizedText } from "../../../utils/normalizeText";
import { useAuth } from "../../../Context/AuthContext";

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

const OrdersTable = ({ status }) => {
    const { orders, updateLocalOrderStatus, fetchOrders } = useContext(AdminOrdersContext);
    const { updateOrderStatus, updateAdminNoteOne, updateAdminNoteTwo, sendEmailToCustomer } = useHandleOrders();
    const { user } = useAuth();
    const [cancelOrderId, setCancelOrderId] = useState(null);

    const [nextStatus, setNextStatus] = useState(null);
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 14;
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [loading, setLoading] = useState(false); // ✅ هنا




    useEffect(() => {
        const interval = setInterval(() => {
            fetchOrders();
        }, 5 * 60 * 1000); // كل 5 ثواني
        // console.log("تحديث:", new Date().toLocaleString());
        return () => clearInterval(interval);
    }, [fetchOrders]);



    const statusMap = {
        all: "الكل",
        pending: "طلب جديد",
        delayed: "معلق",
        processed: "قيد التنفيذ",
        shipped: "تم الشحن",
        delivered: "تم التسليم",
        returned: "تم الإرجاع",
        canceled: "تم الإلغاء",
    };


    const statusCounts = {
        all: orders.length,
        pending: orders.filter(order => order.status === "pending" && order.adminNoteTwo !== "معلق").length,
        delayed: orders.filter(order => order.adminNoteTwo === "معلق").length,
        processed: orders.filter(order => order.status === "processed").length,
        shipped: orders.filter(order => order.status === "shipped").length,
        delivered: orders.filter(order => order.status === "delivered").length,
        returned: orders.filter(order => order.status === "returned").length,
        canceled: orders.filter(order => order.status === "canceled").length,
    };

    // فلترة الطلبات حسب status و البحث
    const filteredOrders = useMemo(() => {
        return orders
            .filter((o) =>
                status === "all"
                    ? true
                    : status === "delayed"
                        ? o.adminNoteTwo === "معلق"
                        : status === "pending"
                            ? o.status === "pending" && o.adminNoteTwo !== "معلق"
                            : o.status === status
            )
            .filter((order) => {
                const query = search.trim().toLowerCase();
                if (!query) return true;
                return (
                    order.orderCode?.toLowerCase().includes(query) ||
                    order.username?.toLowerCase().includes(query) ||
                    order.phoneNumber?.toLowerCase().includes(query)
                );
            })
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    }, [orders, status, search]);



    const renderDynamicBtn = (order) => {
        switch (status) {
            case "pending":
            case "delayed":
            case "processed":
            case "shipped":
                return <td>
                    {(order.status === "pending" || order.status === "processed" || order.status === "shipped") && (
                        <button type='button' className={`continueBtn ${order.status}`} onClick={() => handleSequentialStatus(order)}>
                            <VscDebugReverseContinue />
                        </button>
                    )}
                </td>;
            default:
                return <></>;
        }
    };
    const renderDynamicBtnTh = () => {
        switch (status) {
            case "pending":
            case "delayed":
            case "processed":
            case "shipped":
                return <th>متابعة</th>;
            default:
                return <></>;
        }
    };


    const renderDynamicColumnTb = (order) => {
        switch (status) {
            case "pending":
                return <td>{new Date(order.createdAt).toLocaleDateString("ar-EG")}</td>;
            case "processed":
            case "shipped":
            case "delivered":
            case "returned":
            case "canceled":
                return <td>{new Date(order.updatedAt).toLocaleDateString("ar-EG")}</td>;
            default:
                return <td>{new Date(order.updatedAt).toLocaleDateString("ar-EG")}</td>;

        }
    };

    const renderDynamicColumnTh = () => {
        switch (status) {
            case "pending":
                return <th>تاريخ الطلب</th>;
            case "processed":
            case "shipped":
            case "delivered":
            case "returned":
            case "canceled":
                return <th>اخر تعديل</th>;
            default:
                return <th>اخر تعديل</th>;
        }
    };
    const renderDynamicColumnTb2 = (order) => {
        switch (status) {
            case "pending":
            case "processed":
            case "shipped":
                return <td>{order.area} - {order.flatNum}</td>;

            case "delivered":
            case "returned":
                return order.adminMessage
                    ? <td className='adminMsgC' title={normalizedText(order.adminMessage)}>{normalizedText(order.adminMessage)}</td>
                    : <td>{order.area} - {order.flatNum}</td>;
            case "canceled":
                return order.adminMessage
                    ? <td className='adminMsgC' title={normalizedText(order.adminMessage)}>{normalizedText(order.adminMessage)}</td>
                    : <td>{order.area} - {order.flatNum}</td>;

            default:
                return <td>{order.area} - {order.flatNum}</td>;
        }
    };

    const renderDynamicColumnTh2 = () => {
        switch (status) {
            case "pending":
            case "processed":
            case "shipped":
                return <th>العنوان</th>;
            case "delivered":
            case "returned":
                return <th>العنوان/ ملاحظ</th>;
            case "canceled":
                return <th>حالة الدفع</th>;

            default:
                return <th>العنوان</th>;
        }
    };

    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const paginatedOrders = filteredOrders.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // تغيير الحالة العادية
    const handleChangeStatus = async (orderId, newStatus, currentStatus) => {
        if (!orderId) return;
        if (!newStatus || newStatus === currentStatus) return;
        const order = orders.find(o => o.id === orderId);

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
</a>`
                );
                fetchOrders()
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
            fetchOrders()
            setLoading(false);
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

            fetchOrders()
            setLoading(false);
        }
    };

    const handleSaveShippingCost = async (orderId, { cost, paymentStatus }) => {
        if (!orderId) return;
        const order = orders.find(o => o.id === orderId);
        const numericCost = Number(cost);
        const totalPrice = numericCost + Number(order.total || 0);

        if (isNaN(numericCost) || numericCost < 1) {
            toast.error("من فضلك أدخل مصاريف شحن صحيحة أكبر من صفر");
            setSelectedOrderId(null);
            setNextStatus(null);
            return;
        }

        if (!paymentStatus) {
            toast.error("من فضلك اختر حالة الدفع");
            return;
        }

        try {
            setLoading(true);

            // 📝 حفظ مصاريف الشحن
            await updateAdminNoteOne(orderId, numericCost);

            // 📝 حفظ حالة الدفع
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
  `
                );
                toast.success(
                    `تم نقل الطلب إلى "${statusMap[nextStatus]}" وحفظ مصاريف الشحن وحالة الدفع`
                );
            }

            setSelectedOrderId(null);
            setNextStatus(null);
        } catch (err) {
            toast.error("حدث خطأ أثناء حفظ مصاريف الشحن وحالة الدفع", {
                position: "top-right",
            });
            console.log(err.message);
        } finally {
            setLoading(false);
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
        }
    };


    const handleRefrishe = () => {
        setLoading(true);

        fetchOrders()
            .finally(() => {
                setLoading(false);
            });
    };

    useEffect(() => {
        handleRefrishe();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const totalFilteredOrders = filteredOrders.length;
    return (
        <div className="orders-table">
            <div className="orders-filters">
                <div className="filter-btn-container">
                    {Object.keys(statusMap).map((key) => (
                        <button
                            type='button'
                            key={key}
                            className={status === key ? "active" : ""}
                            onClick={() => {
                                setCurrentPage(1);
                                navigate(
                                    key === "all" ? "/admin/orders" : `/admin/orders?status=${key}`
                                )
                            }}
                        >
                            <span className='orderCount'> {statusCounts[key]} </span> {statusMap[key]}
                        </button>
                    ))}
                    <button type='button' title='تحديث' onClick={handleRefrishe} className='refreshBtn'>
                        <LuRefreshCw />
                    </button>
                </div>

                <div className="input-container">
                    <label htmlFor="searchOrders">ابحث برقم الهاتف أو الاسم أو كود الطلب | عدد الطلبات: <strong>{totalFilteredOrders}</strong></label>

                    <input
                        type="text"
                        placeholder="ابحث..."
                        title="ابحث برقم الهاتف أو الاسم أو كود الطلب..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </div>
            </div>

            {loading ? (
                <div className="orders-loading">
                    <ThreeDot color="#ff6f33" height={60} width={60} />

                </div>
            ) : (
                <div className="table-responsive">
                <table>
                    <thead>
                        <tr>
                            <th>كود الطلب</th>
                            <th>العميل</th>
                            <th>الموبايل</th>
                            {renderDynamicColumnTh2()}
                            {renderDynamicColumnTh()}
                            {status !== "pending" && <th>الشحن</th>}
                            <th>الإجمالي</th>
                            <th>الحالة</th>
                            {renderDynamicBtnTh()}
                            <th>خيارات</th>
                        </tr>
                    </thead>

                    <tbody>
                        {paginatedOrders.length > 0 ? (
                            paginatedOrders.map((order) => (
                                <tr key={order.id}>
                                    <td>
                                        <Link className='invoiceLink'
                                            title='صفحة الطلب'
                                            to={`/admin/orders/invoice/${order.id}`}>
                                            <span><IoOpenOutline /></span> {order.orderCode}
                                        </Link>
                                    </td>
                                    <td>{order.username}</td>
                                    <td>{order.phoneNumber}</td>
                                    {renderDynamicColumnTb2(order)}
                                    {renderDynamicColumnTb(order)}
                                    {status !== "pending" && <td>{Number(order.adminNoteOne)} ج.م</td>}
                                    {Number(order.adminNoteOne) > 0 ? (
                                        <td>{(Number(order.total || 0) + Number(order.adminNoteOne || 0)).toLocaleString('en-EG')} ج.م</td>
                                    ) : (
                                        <td>{Number(order.total || 0).toLocaleString('en-EG')} ج.م</td>
                                    )}

                                    <td>
                                        {order.adminNoteTwo && order.status === "pending" ? (
                                            <span className={`status ${order.status} delayed`}>
                                                معلق
                                            </span>
                                        ) : (
                                            <span className={`status ${order.status}`}>
                                                {statusMap[order.status] || order.status}
                                            </span>
                                        )}
                                    </td>
                                    {renderDynamicBtn(order)}
                                    <td>
                                        <OrderMenu
                                            order={order}
                                            pageStatus={status}
                                            handleChangeStatus={(newStatus) =>
                                                handleChangeStatus(order.id, newStatus, order.status)
                                            }
                                        />
                                    </td>
                                </tr>
                            ))

                        ) : (
                            <tr>
                                <td colSpan="9" className="no-orders">
                                    لا توجد طلبات متاحة
                                </td>
                            </tr>
                        )}

                    </tbody>
                </table>
                </div>)}

            <ShippingCostModal
                orderId={selectedOrderId}
                isOpen={!!selectedOrderId}
                onClose={() => {
                    setSelectedOrderId(null);
                    setNextStatus(null);
                    toast.error('تم الإلغاء');
                }}
                onSave={handleSaveShippingCost}
            />

            <CancelReasonModal
                orderId={cancelOrderId}
                isOpen={!!cancelOrderId}
                onClose={() => {
                    setCancelOrderId(null);
                    toast.error("تم الإلغاء");
                }}
                onSave={handleSaveCancelReason}
            />


            {totalPages > 1 && (
                <AdminOrderPagination
                    itemsPerPage={itemsPerPage}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    setCurrentPage={setCurrentPage}
                />
            )}

            <ToastContainer position="top-right" toastClassName="custom-toast" autoClose={3000} />
        </div>

    );
};

export default OrdersTable;
