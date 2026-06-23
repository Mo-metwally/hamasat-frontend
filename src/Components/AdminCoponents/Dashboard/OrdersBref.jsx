import React, { useContext, useMemo } from "react";
import { AdminOrdersContext } from "../../../Context/AdminOrdersContext";
import { FaCalendarAlt } from "react-icons/fa";

const OrdersBref = () => {
    const { orders } = useContext(AdminOrdersContext);

    // فلترة الطلبات لليوم الحالي فقط
    const todayOrders = useMemo(() => {
        if (!orders) return [];

        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));

        return orders.filter((o) => {
            const createdAt = new Date(o.createdAt);
            return createdAt >= startOfDay && createdAt <= endOfDay;
        });
    }, [orders]);

    // نحسب القيم اللي هنظهرها من طلبات النهارده بس
    const stats = useMemo(() => {
        const totalOrders = todayOrders.length;
        const totalItems = todayOrders.filter((o) => o.status === "pending").length;
        const canceled = todayOrders.filter((o) => o.status === "canceled").length;
        const returns = todayOrders.filter((o) => o.status === "returned").length;
        const fulfilled = todayOrders.filter(
            (o) => o.status === "processed" || o.status === "shipped"
        ).length;
        const delivered = todayOrders.filter((o) => o.status === "delivered").length;

        return { totalOrders, totalItems, returns, fulfilled, delivered, canceled };
    }, [todayOrders]);


    return (
        <div className="orders-bref">
            {/* العمود الأول للتاريخ */}
            <div className="bref-item today">
                <FaCalendarAlt className="icon" />
                <span>اليوم</span>
            </div>

            {/* بقية الكروت */}
            <div className="bref-item borderLeft">
                <span className="label">إجمالي الطلبات</span>
                <span className="value">{stats.totalOrders}</span>
            </div>

            <div className="bref-item borderLeft">
                <span className="label">عدد الطلبات الجديدة</span>
                <span className="value">{stats.totalItems}</span>
            </div>

            <div className="bref-item borderLeft">
                <span className="label">الطلبات المُنفذة</span>
                <span className="value">{stats.fulfilled}</span>
            </div>

            <div className="bref-item borderLeft">
                <span className="label">الطلبات المُسلّمة</span>
                <span className="value">{stats.delivered}</span>
            </div>

            <div className="bref-item borderLeft">
                <span className="label">المرتجعات</span>
                <span className="value">{stats.returns}</span>
            </div>

            <div className="bref-item">
                <span className="label">الإلغاءات</span>
                <span className="value">{stats.canceled}</span>
            </div>
        </div>
    );
};

export default OrdersBref;
