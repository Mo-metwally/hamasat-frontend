import { FaBox, FaWarehouse, FaPlusCircle, FaShoppingCart, FaBoxes, FaTags } from "react-icons/fa";
import { MdListAlt, MdPending, MdLocalShipping, MdAssignmentTurnedIn, MdCancel, MdAssignmentReturn } from "react-icons/md";
import { PiHandWithdrawFill, PiStackOverflowLogoDuotone, PiWarningBold } from "react-icons/pi";
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Dashboard.scss";
import OrdersBref from "./OrdersBref";
import { ThreeDot } from "react-loading-indicators";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useProducts } from "../../../hooks/useProducts";


const Dashboard = () => {
    const { products } = useProducts();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                await axios.post(
                    `${process.env.REACT_APP_API_URL}/api/v1/storage/analyze`,
                    {}, // body فاضي
                    { withCredentials: true } // config
                );

                const res = await axios.get(
                    `${process.env.REACT_APP_API_URL}/api/v1/storage`,
                    { withCredentials: true }
                );

                setStats(res.data.data);
            } catch (error) {
                console.error("Error fetching analysis:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className='loading'>
                <ThreeDot color="#ff6f33" size="medium" text="جاري التحقق من الصلاحيات..." textColor="#ff6f33" />
            </div>
        )
    };
    if (!stats) return <>لا يوجد بيانات</>;

    const totalStockOutProducts = products.filter((p) => p.remaining === 0).length;
    const totalLowStockProducts = products.filter((p) => p.remaining <= 5).length;

    const totalOrders =
        stats.totalOrdersPending +
        stats.totalOrdersProcessed +
        stats.totalOrdersShipped +
        stats.totalOrdersDelivered +
        stats.totalOrdersCanceled +
        stats.totalOrdersReturned;


    return (

        <>
            <Helmet>
                <title>لوحة التحكم </title>
                <meta
                    name="description"
                    content="عرض الإحصائيات والتقارير الخاصة بمتجر همسات هوم."
                />
                <meta name="robots" content="noindex, nofollow" />
                <link rel="canonical" href={`${process.env.REACT_APP_API_URL}/admin/dashboard`} />
            </Helmet>

            <div className="dashboard">
                {/* الكروت الصغيرة */}
                <OrdersBref />
                <div className="dashboard-sec">
                    <div>
                        <h4>المسابقات</h4>
                    </div>
                    <div className="cards-grid small">
                        <Link to='/admin/competition'>
                            <div className="card small"><h3> المسابقات <PiHandWithdrawFill className="icon" /></h3><p></p></div>
                        </Link>
                    </div>
                </div>
                <div className="dashboard-sec">
                    <div>
                        <h4>بيانات المخزن</h4>
                    </div>
                    <div className="cards-grid small">
                        <Link to='/admin/productslist?sort=createdAt'>
                            <div className="card small"><h3>إجمالي المنتجات <FaBox className="icon" /></h3><p>{stats.totalProducts}</p></div>
                        </Link>
                        <Link to='/admin/productslist?sort=remaining'>
                            <div className="card small"><h3>المخزون <FaWarehouse className="icon" /></h3><p>{stats.totalStockProducts}</p></div>
                        </Link>
                        <Link to='/admin/productslist?sort=createdAt'>
                            <div className="card small"><h3>منتجات جديدة <FaPlusCircle className="icon" /></h3><p>{stats.totalIsNewProducts}</p></div>
                        </Link>
                        <Link to='/admin/productslist?sort=discount'>
                            <div className="card small"><h3>منتجات عليها عرض <FaTags className="icon" /></h3><p>{stats.totalIsSaleProducts}</p></div>
                        </Link>
                        <Link to='/admin/productslist?sort=sold'>
                            <div className="card small"><h3>منتجات مباعة <FaShoppingCart className="icon" /></h3><p>{stats.totalSoldProducts}</p></div>
                        </Link>
                        <Link to='/admin/productslist?sort=remaining'>
                            <div className="card small"><h3>منتجات متبقية <FaBoxes className="icon" /></h3><p>{stats.totalRemainingProducts}</p></div>
                        </Link>
                        <Link to='/admin/productslist?sort=lowStock'>
                            <div className="card small"><h3> منتجات برصيد منخفض <PiStackOverflowLogoDuotone className="icon" /></h3><p>{totalLowStockProducts}</p></div>
                        </Link>
                        <Link to='/admin/productslist?sort=outOfStock'>
                            <div className="card small"><h3> منتجات بدون رصيد  <PiWarningBold className="icon" /></h3><p>{totalStockOutProducts}</p></div>
                        </Link>
                    </div>
                </div>

                <div className="dashboard-sec">
                    <div>
                        <h4>بيانات الطلبات</h4>
                    </div>
                    <div className="cards-grid small">
                        <Link to='/admin/orders'>
                            <div className="card small"><h3>كل الطلبات <MdListAlt className="icon" /></h3><p>{totalOrders}</p></div>
                        </Link>
                        <Link to='/admin/orders?status=pending'>
                            <div className="card small"><h3>طلبات جديدة <MdPending className="icon" /></h3><p>{stats.totalOrdersPending}</p></div>
                        </Link>
                        <Link to='/admin/orders?status=processed'>
                            <div className="card small"><h3>طلبات تحت المعالجة <MdAssignmentTurnedIn className="icon" /></h3><p>{stats.totalOrdersProcessed}</p></div>
                        </Link>
                        <Link to='/admin/orders?status=shipped'>
                            <div className="card small"><h3>طلبات مشحونة <MdLocalShipping className="icon" /></h3><p>{stats.totalOrdersShipped}</p></div>
                        </Link>
                        <Link to='/admin/orders?status=delivered'>
                            <div className="card small"><h3>طلبات مسلّمة <FaShoppingCart className="icon" /></h3><p>{stats.totalOrdersDelivered}</p></div>
                        </Link>
                        <Link to='/admin/orders?status=returned'>
                            <div className="card small"><h3>طلبات ملغية <MdCancel className="icon" /></h3><p>{stats.totalOrdersCanceled}</p></div>
                        </Link>
                        <Link to='/admin/orders?status=canceled'>
                            <div className="card small"><h3>طلبات مرتجعة <MdAssignmentReturn className="icon" /></h3><p>{stats.totalOrdersReturned}</p></div>
                        </Link>
                    </div>
                </div>
            </div>
        </>

    );
};

export default Dashboard;
