import React, { useContext, useMemo } from "react";
import { AdminOrdersContext } from "../../../Context/AdminOrdersContext";
import { FaCalendarAlt } from "react-icons/fa";

const FinancialDay = () => {
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
        // دالة مساعدة لتحويل string لرقم
        const toNumber = (value) => parseFloat(value) || 0;

        const totalOrdersPrice = todayOrders.reduce((sum, o) => sum + toNumber(o.total), 0);
        const newOrdersPrice = todayOrders
            .filter((o) => o.status === "pending")
            .reduce((sum, o) => sum + toNumber(o.total), 0);
        const canceledPrice = todayOrders
            .filter((o) => o.status === "canceled")
            .reduce((sum, o) => sum + toNumber(o.total), 0);
        const returnsPrice = todayOrders
            .filter((o) => o.status === "returned")
            .reduce((sum, o) => sum + toNumber(o.total), 0);
        const fulfilledPrice = todayOrders
            .filter((o) => o.status === "processed" || o.status === "shipped")
            .reduce((sum, o) => sum + toNumber(o.total), 0);
        const deliveredPrice = todayOrders
            .filter((o) => o.status === "delivered")
            .reduce((sum, o) => sum + toNumber(o.totalP), 0);

        return { totalOrdersPrice, newOrdersPrice, canceledPrice, returnsPrice, fulfilledPrice, deliveredPrice };
    }, [todayOrders]);




    return (
        <div className="orders-bref">
            {/* العمود الأول للتاريخ */}
            <div className="bref-item today">
                <FaCalendarAlt className="icon" />
                <span>اليوم</span>
            </div>

            <div className="bref-item borderLeft">
                <span className="label">إجمالي الطلبات</span>
                <span className="value">{stats.totalOrdersPrice.toLocaleString()} ج.م</span>
            </div>

            <div className="bref-item borderLeft">
                <span className="label">الطلبات الجديدة</span>
                <span className="value">{stats.newOrdersPrice.toLocaleString()} ج.م</span>
            </div>

            <div className="bref-item borderLeft">
                <span className="label">الطلبات المُنفذة</span>
                <span className="value">{stats.fulfilledPrice.toLocaleString()} ج.م</span>
            </div>

            <div className="bref-item borderLeft">
                <span className="label">الطلبات المُسلّمة</span>
                <span className="value">{stats.deliveredPrice.toLocaleString()} ج.م</span>
            </div>

            <div className="bref-item borderLeft">
                <span className="label">المرتجعات</span>
                <span className="value">{stats.returnsPrice.toLocaleString()} ج.م</span>
            </div>

            <div className="bref-item">
                <span className="label">الإلغاءات</span>
                <span className="value">{stats.canceledPrice.toLocaleString()} ج.م</span>
            </div>

        </div>
    );
};

export default FinancialDay;
