import React, { useContext, useMemo, useState, useRef } from 'react';
import { AdminOrdersContext } from '../../../Context/AdminOrdersContext';
import { useReactToPrint } from "react-to-print";
import './Competition.css';
import { Helmet } from 'react-helmet-async';
import AdminOrderPagination from '../OrdersTable/AdminOrderPagination';

const Competition = () => {
    const { orders } = useContext(AdminOrdersContext);
    const [filter, setFilter] = useState("all");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 14; // عدد العناصر في الصفحة
    const printRef = useRef(null);

    const competitionData = useMemo(() => {
        const grouped = {};
        const deliveredOrders = orders.filter(order => order.status === "delivered");

        deliveredOrders.forEach(order => {
            const { username, phoneNumber, orderCode, total, updatedAt } = order;
            const key = `${username}-${phoneNumber}`;

            if (!grouped[key]) {
                grouped[key] = {
                    username,
                    phoneNumber,
                    totalSpent: 0,
                    lastOrderCode: orderCode,
                    lastOrderDate: updatedAt,
                };
            }

            grouped[key].totalSpent += parseFloat(total) || 0;

            if (new Date(updatedAt) > new Date(grouped[key].lastOrderDate)) {
                grouped[key].lastOrderCode = orderCode;
                grouped[key].lastOrderDate = updatedAt;
            }
        });

        return Object.values(grouped);
    }, [orders]);

    const filteredData = useMemo(() => {
        let data = [...competitionData];

        // فلترة حسب المبلغ
        if (filter === "5000") data = data.filter(client => client.totalSpent >= 5000);
        else if (filter === "10000") data = data.filter(client => client.totalSpent >= 10000);
        else if (filter === "15000") data = data.filter(client => client.totalSpent >= 15000);
        else if (filter === "20000") data = data.filter(client => client.totalSpent >= 20000);

        // فلترة حسب التاريخ
        if (dateFrom) {
            const from = new Date(dateFrom);
            from.setHours(0, 0, 0, 0);
            data = data.filter(client => new Date(client.lastOrderDate) >= from);
        }
        if (dateTo) {
            const to = new Date(dateTo);
            to.setHours(23, 59, 59, 999);
            data = data.filter(client => new Date(client.lastOrderDate) <= to);
        }

        return data;
    }, [competitionData, filter, dateFrom, dateTo]);

    // حساب البيانات للباجنيشن
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `مسابقة-همسات-${new Date().toLocaleDateString("en-GB").replace(/\//g, "-")}`,
        onAfterPrint: () => console.log("تمت طباعة الكروت ✅"),
    });

    return (
        <>
            <Helmet>
                <title>مسابقة همسات</title>
                <meta
                    name="description"
                    content="طباعة تفاصيل فاتورة الطلب المحدد في متجر همسات هوم."
                />
                <meta name="robots" content="noindex, nofollow" />
                <link rel="canonical" href={`${process.env.REACT_APP_API_URL}/admin/orders/invoice/:orderId`} />
            </Helmet>

            <div className="orders-table">
                <h2 className='comptitionHead'>
                    <span>مسابقة السحب</span>
                    <span style={{ fontSize: "16px", marginRight: "10px" }}>
                        عدد الاحتمالات: {filteredData.length}
                    </span>
                </h2>

                <div className='comptitionHeadSort'>
                    <select
                        aria-label='فلترة العملاء'
                        title='فلترة العملاء'
                        value={filter}
                        onChange={(e) => { setFilter(e.target.value); setCurrentPage(1); }}
                    >
                        <option value="all">كل العملاء</option>
                        <option value="5000">إجمالي فواتير 5000 أو أكتر</option>
                        <option value="10000">إجمالي فواتير 10000 أو أكتر</option>
                        <option value="15000">إجمالي فواتير 15000 أو أكتر</option>
                        <option value="20000">إجمالي فواتير 20000 أو أكتر</option>
                    </select>

                    <label style={{ marginLeft: "10px" }}>من: </label>
                    <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setCurrentPage(1); }} />

                    <label style={{ marginLeft: "10px" }}>إلى: </label>
                    <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setCurrentPage(1); }} />

                    <button className="print-btn" onClick={handlePrint}>
                        🖨️ طباعة الكروت
                    </button>
                </div>

                <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }} className="no-print">
                    <thead>
                        <tr>
                            <th>اسم العميل</th>
                            <th>رقم التليفون</th>
                            <th>إجمالي الفواتير</th>
                            <th>رقم اخر طلب</th>
                            <th>تاريخ الطلب</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.length > 0 ? (
                            paginatedData.map((client, index) => (
                                <tr key={index}>
                                    <td>{client.username}</td>
                                    <td>{client.phoneNumber}</td>
                                    <td>
                                        {client.totalSpent.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ج.م
                                    </td>
                                    <td>{client.lastOrderCode}</td>
                                    <td>{new Date(client.lastOrderDate).toLocaleDateString("ar-EG")}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" style={{ textAlign: "center" }}>
                                    لا يوجد نتائج مطابقة
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {totalPages > 1 && (
                    <AdminOrderPagination
                        itemsPerPage={itemsPerPage}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        setCurrentPage={setCurrentPage}
                    />
                )}
            </div>

            <div className="print-refComp" ref={printRef}>
                <div className="print-cards">
                    {filteredData.map((client, index) => (
                        <div className="print-card" key={index}>
                            <div className="name">{client.username}</div>
                            <div className="code">{client.lastOrderCode}</div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default Competition;
