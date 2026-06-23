import React, { useContext } from "react";
import { useLocation } from "react-router-dom";
import { AdminOrdersContext } from "../../../Context/AdminOrdersContext";
import OrdersTable from "./OrdersTable";
import { Helmet } from "react-helmet-async";

const AdminOrders = () => {
    const { orders } = useContext(AdminOrdersContext);
    const location = useLocation();

    // قراءة الـ query param
    const queryParams = new URLSearchParams(location.search);
    const status = queryParams.get("status") || "all";

    // فلترة الطلبات حسب الـ status
    const filteredOrders =
        status === "all" ? orders : orders.filter((o) => o.status === status);

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

    return (
        <>
            <Helmet>
                <title>{`إدارة الطلبات - ${statusMap[status]}`}</title>
                <meta
                    name="description"
                    content="عرض وإدارة طلبات العملاء في متجر همسات هوم."
                />
                <meta name="robots" content="noindex, nofollow" />
                <link rel="canonical" href={`${process.env.REACT_APP_API_URL}/admin/orders?status=${status}`} />
            </Helmet>

            <OrdersTable orders={filteredOrders} status={status} />
        </>
    );
};

export default AdminOrders;
