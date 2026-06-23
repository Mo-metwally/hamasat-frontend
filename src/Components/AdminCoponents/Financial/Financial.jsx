import { FaBox, FaWarehouse, FaPlusCircle, FaShoppingCart, FaBoxes, FaTags, FaMoneyBillWave } from "react-icons/fa";
import { MdListAlt, MdPending, MdLocalShipping, MdAssignmentTurnedIn, MdCancel, MdAssignmentReturn, MdAttachMoney } from "react-icons/md";
import { BiTrendingUp, BiTrendingDown } from "react-icons/bi";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { ThreeDot } from "react-loading-indicators";
import FinancialDay from "./FinancialDay";
import { Link } from "react-router-dom";
import { useProducts } from "../../../hooks/useProducts";
import { PiStackOverflowLogoDuotone, PiWarningBold } from "react-icons/pi";
import { useAuth } from "../../../Context/AuthContext";
import './Financial.scss';

const FinancialData = () => {
    const { products } = useProducts();
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const [vendorId, setVendorId] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [vendors, setVendors] = useState([]);

    useEffect(() => {
        if (user && user.role === 'superAdmin') {
            axios.get(`${process.env.REACT_APP_API_URL}/api/v1/admin/vendors?limit=1000`, { withCredentials: true })
                .then(res => setVendors(res.data.data.data || res.data.data || []))
                .catch(err => console.error("Error fetching vendors:", err));
        }
    }, [user]);

    const fetchData = async (overrideFilters) => {
        try {
            setLoading(true);
            const payload = overrideFilters || { vendorId, startDate, endDate };
            const res = await axios.post(
                `${process.env.REACT_APP_API_URL}/api/v1/storage/analyze`,
                payload,
                { withCredentials: true }
            );
            setStats(res.data.data);
        } catch (error) {
            console.error("Error fetching analysis:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData({});
    }, []);

    const clearFilters = () => {
        setVendorId("");
        setStartDate("");
        setEndDate("");
        fetchData({ vendorId: "", startDate: "", endDate: "" });
    };

    if (loading) {
        return (
            <div className='loading'>
                <ThreeDot color="#ff6f33" size="medium" text="جاري التحقق من الصلاحيات..." textColor="#ff6f33" />
            </div>
        )
    };
    if (!stats) return <p className="loading">لا يوجد بيانات</p>;

    // Filter products locally for stock info to match the selected vendor
    const filteredProducts = (user && user.role === 'superAdmin' && vendorId) 
        ? products.filter(p => p.vendorId === vendorId || (p.vendor && p.vendor.id === vendorId))
        : products;

    const totalStockOutProducts = filteredProducts.filter((p) => p.remaining === 0).length;
    const totalLowStockProducts = filteredProducts.filter((p) => p.remaining > 0 && p.remaining <= 5).length;

    const totalOrders =
        stats.totalOrdersPending +
        stats.totalOrdersProcessed +
        stats.totalOrdersShipped +
        stats.totalOrdersDelivered +
        stats.totalOrdersCanceled +
        stats.totalOrdersReturned;

    return (
        <div className="financial-dashboard-advanced">
            <FinancialDay />

            <div className="filters-glass-panel">
                <h4>الفلاتر المالية المتقدمة</h4>
                <div className="filters-row">
                    {user && user.role === 'superAdmin' && (
                        <div className="filter-group">
                            <label>البائع</label>
                            <select value={vendorId} onChange={e => setVendorId(e.target.value)}>
                                <option value="">كل البائعين / الإدارة</option>
                                {vendors.map(v => (
                                    <option key={v.id} value={v.id}>{v.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    <div className="filter-group">
                        <label>من تاريخ</label>
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                    </div>
                    <div className="filter-group">
                        <label>إلى تاريخ</label>
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                    </div>
                    <div className="buttons-group">
                        <button className="btn-apply" onClick={() => fetchData()}>تطبيق الفلتر</button>
                        <button className="btn-clear" onClick={clearFilters}>إلغاء وتحديث</button>
                    </div>
                </div>
            </div>

            <div className="section-title">الأداء المالي الإجمالي</div>
            <div className="main-finance-cards">
                <div className="finance-card">
                    <h3>إجمالي سعر المنتجات</h3>
                    <p>{Number(stats.totalProductsPrice || 0).toLocaleString('en-EG', { maximumFractionDigits: 2 })} <span>ج.م</span></p>
                </div>
                <div className="finance-card">
                    <h3>إجمالي التكلفة</h3>
                    <p>{Number(stats.totalProductsBasePrice || 0).toLocaleString('en-EG', { maximumFractionDigits: 2 })} <span>ج.م</span></p>
                </div>
                <div className="finance-card">
                    <h3>الإيرادات المحققة</h3>
                    <p>{Number(stats.totalOrdersRevenue || 0).toLocaleString('en-EG', { maximumFractionDigits: 2 })} <span>ج.م</span></p>
                </div>
                <div className="finance-card highlight">
                    <h3>صافي الأرباح</h3>
                    <p>{Number(stats.totalProfit || 0).toLocaleString('en-EG', { maximumFractionDigits: 2 })} <span>ج.م</span></p>
                </div>
            </div>

            <div className="section-title">إحصائيات المخزون والمنتجات</div>
            <div className="metrics-grid">
                <Link to='/admin/productslist?sort=createdAt'>
                    <div className="metric-card">
                        <div className="info">
                            <p>إجمالي المنتجات</p>
                            <h3>{stats.totalProducts}</h3>
                        </div>
                        <div className="icon-wrapper blue"><FaBox /></div>
                    </div>
                </Link>
                <Link to='/admin/productslist?sort=remaining'>
                    <div className="metric-card">
                        <div className="info">
                            <p>إجمالي المخزون المتاح</p>
                            <h3>{stats.totalStockProducts}</h3>
                        </div>
                        <div className="icon-wrapper green"><FaWarehouse /></div>
                    </div>
                </Link>
                <Link to='/admin/productslist?sort=sold'>
                    <div className="metric-card">
                        <div className="info">
                            <p>المنتجات المباعة</p>
                            <h3>{stats.totalSoldProducts}</h3>
                        </div>
                        <div className="icon-wrapper orange"><FaShoppingCart /></div>
                    </div>
                </Link>
                <Link to='/admin/productslist?sort=lowStock'>
                    <div className="metric-card">
                        <div className="info">
                            <p>منتجات برصيد منخفض</p>
                            <h3>{totalLowStockProducts}</h3>
                        </div>
                        <div className="icon-wrapper yellow"><PiStackOverflowLogoDuotone /></div>
                    </div>
                </Link>
                <Link to='/admin/productslist?sort=outOfStock'>
                    <div className="metric-card">
                        <div className="info">
                            <p>منتجات بدون رصيد</p>
                            <h3>{totalStockOutProducts}</h3>
                        </div>
                        <div className="icon-wrapper red"><PiWarningBold /></div>
                    </div>
                </Link>
            </div>

            <div className="section-title">إحصائيات الطلبات والشحن</div>
            <div className="metrics-grid">
                <Link to='/admin/orders'>
                    <div className="metric-card">
                        <div className="info">
                            <p>كل الطلبات</p>
                            <h3>{totalOrders}</h3>
                        </div>
                        <div className="icon-wrapper blue"><MdListAlt /></div>
                    </div>
                </Link>
                <Link to='/admin/orders?status=pending'>
                    <div className="metric-card">
                        <div className="info">
                            <p>طلبات جديدة</p>
                            <h3>{stats.totalOrdersPending}</h3>
                        </div>
                        <div className="icon-wrapper yellow"><MdPending /></div>
                    </div>
                </Link>
                <Link to='/admin/orders?status=processed'>
                    <div className="metric-card">
                        <div className="info">
                            <p>تحت المعالجة</p>
                            <h3>{stats.totalOrdersProcessed}</h3>
                        </div>
                        <div className="icon-wrapper purple"><MdAssignmentTurnedIn /></div>
                    </div>
                </Link>
                <Link to='/admin/orders?status=shipped'>
                    <div className="metric-card">
                        <div className="info">
                            <p>طلبات مشحونة</p>
                            <h3>{stats.totalOrdersShipped}</h3>
                        </div>
                        <div className="icon-wrapper blue"><MdLocalShipping /></div>
                    </div>
                </Link>
                <Link to='/admin/orders?status=delivered'>
                    <div className="metric-card">
                        <div className="info">
                            <p>طلبات مسلّمة</p>
                            <h3>{stats.totalOrdersDelivered}</h3>
                        </div>
                        <div className="icon-wrapper green"><FaShoppingCart /></div>
                    </div>
                </Link>
                <Link to='/admin/orders?status=returned'>
                    <div className="metric-card">
                        <div className="info">
                            <p>طلبات مرتجعة</p>
                            <h3>{stats.totalOrdersReturned}</h3>
                        </div>
                        <div className="icon-wrapper red"><MdAssignmentReturn /></div>
                    </div>
                </Link>
                <Link to='/admin/orders?status=canceled'>
                    <div className="metric-card">
                        <div className="info">
                            <p>طلبات ملغية</p>
                            <h3>{stats.totalOrdersCanceled}</h3>
                        </div>
                        <div className="icon-wrapper red"><MdCancel /></div>
                    </div>
                </Link>
            </div>

        </div>
    );
};

const Financial = () => {
    return (
        <FinancialData />
    );
};

export default Financial;
