import React, { useState, useEffect } from 'react';
import { IoIosArrowRoundBack, IoIosArrowRoundDown } from "react-icons/io";
import { Link, useLocation } from 'react-router-dom';
import { MdDoubleArrow, MdDashboard, MdInventory, MdOutlinePointOfSale, MdAccountBalanceWallet, MdSettingsApplications } from "react-icons/md";
import { FaBoxOpen, FaClipboardList, FaStore, FaMoneyBillWave, FaTrophy, FaImages, FaUsers } from "react-icons/fa";
import { BsBoxSeam, BsTags } from "react-icons/bs";
import { FiUsers, FiSettings } from "react-icons/fi";
import { BiUserCircle } from "react-icons/bi";
import './AdminSidebar.css';

const AdminSidebar = ({ userRole }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();
    
    const [openSections, setOpenSections] = useState({
        dashboard: false,
        products: false,
        orders: false,
        finance: false,
        settings: false,
    });

    useEffect(() => {
        const path = location.pathname + location.search;
        if (path === '/admin') setOpenSections(prev => ({ ...prev, dashboard: true }));
        else if (path.includes('products') || path.includes('categories')) setOpenSections(prev => ({ ...prev, products: true }));
        else if (path.includes('orders')) setOpenSections(prev => ({ ...prev, orders: true }));
        else if (path.includes('financial') || path.includes('vendors') || path.includes('my-account')) setOpenSections(prev => ({ ...prev, finance: true }));
        else if (path.includes('album') || path.includes('competition')) setOpenSections(prev => ({ ...prev, settings: true }));
    }, [location]);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const toggleSection = (section) => setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    const isActive = (path) => location.pathname + location.search === path;

    return (
        <div id='AdminSidebar' className={isSidebarOpen ? "sidebarShow" : "sidebarHide"}>
            <div className='sidebarHead'>
                <MdDoubleArrow className={`listIcon ${isSidebarOpen ? 'rotated' : ''}`} onClick={toggleSidebar} />
            </div>
            
            <div className='inerAdminSidebar'>
                {/* 1. Dashboard Section */}
                <h6 className="section-header"> 
                    <span className='iconAmindTitel'><MdDashboard /></span><strong> لوحة القيادة</strong>
                </h6>
                <div className={`listContainer ${openSections.dashboard ? 'active' : ''}`}>
                    <h6 className={`listhead ${openSections.dashboard ? 'active' : ''}`} onClick={() => toggleSection('dashboard')}>
                        ▾ الرئيسية {openSections.dashboard ? <IoIosArrowRoundDown /> : <IoIosArrowRoundBack />}
                    </h6>
                    {openSections.dashboard && (
                        <ul className='listItems'>
                            <li className={isActive('/admin') ? 'active-link' : ''}>
                                <Link to="/admin"><FaClipboardList className="link-icon" /> عرض سريع</Link>
                            </li>
                        </ul>
                    )}
                </div>

                <div className="linebut"></div>

                {/* 2. Products & Inventory Section */}
                <h6 className="section-header"> 
                    <span className='iconAmindTitel'><MdInventory /></span><strong> المنتجات والمخزون</strong>
                </h6>
                <div className={`listContainer ${openSections.products ? 'active' : ''}`}>
                    <h6 className={`listhead ${openSections.products ? 'active' : ''}`} onClick={() => toggleSection('products')}>
                        ▾ إدارة المنتجات {openSections.products ? <IoIosArrowRoundDown /> : <IoIosArrowRoundBack />}
                    </h6>
                    {openSections.products && (
                        <ul className='listItems'>
                            <li className={isActive('/admin/addproducts') ? 'active-link' : ''}>
                                <Link to="/admin/addproducts"><BsBoxSeam className="link-icon" /> إضافة منتج جديد</Link>
                            </li>
                            <li className={isActive('/admin/addcategories') ? 'active-link' : ''}>
                                <Link to="/admin/addcategories"><BsTags className="link-icon" /> {userRole === 'superAdmin' ? 'إضافة فئة أو ماركة' : 'إضافة فئة فرعية'}</Link>
                            </li>
                            <li className={isActive('/admin/productslist?sort=createdAt') ? 'active-link' : ''}>
                                <Link to="/admin/productslist?sort=createdAt"><FaBoxOpen className="link-icon" /> مخزن المنتجات</Link>
                            </li>
                            <li className={isActive('/admin/categorieslist') ? 'active-link' : ''}>
                                <Link to="/admin/categorieslist"><FaClipboardList className="link-icon" /> مخزن الفئات</Link>
                            </li>
                        </ul>
                    )}
                </div>

                <div className="linebut"></div>

                {/* 3. Orders Section */}
                <h6 className="section-header"> 
                    <span className='iconAmindTitel'><MdOutlinePointOfSale /></span><strong> المبيعات والطلبات</strong>
                </h6>
                <div className={`listContainer ${openSections.orders ? 'active' : ''}`}>
                    <h6 className={`listhead ${openSections.orders ? 'active' : ''}`} onClick={() => toggleSection('orders')}>
                        ▾ الطلبات {openSections.orders ? <IoIosArrowRoundDown /> : <IoIosArrowRoundBack />}
                    </h6>
                    {openSections.orders && (
                        <ul className='listItems'>
                            <li className={isActive('/admin/orders') ? 'active-link' : ''}><Link to="/admin/orders">كل الطلبات</Link></li>
                            <li className={isActive('/admin/orders?status=pending') ? 'active-link' : ''}><Link to="/admin/orders?status=pending">طلبات جديدة</Link></li>
                            <li className={isActive('/admin/orders?status=processed') ? 'active-link' : ''}><Link to="/admin/orders?status=processed">قيد التنفيذ</Link></li>
                            <li className={isActive('/admin/orders?status=shipped') ? 'active-link' : ''}><Link to="/admin/orders?status=shipped">خرج للتوصيل</Link></li>
                            <li className={isActive('/admin/orders?status=delivered') ? 'active-link' : ''}><Link to="/admin/orders?status=delivered">تم التسليم</Link></li>
                            <li className={isActive('/admin/orders?status=returned') ? 'active-link' : ''}><Link to="/admin/orders?status=returned">مرتجع</Link></li>
                            <li className={isActive('/admin/orders?status=canceled') ? 'active-link' : ''}><Link to="/admin/orders?status=canceled">تم الإلغاء</Link></li>
                        </ul>
                    )}
                </div>

                <div className="linebut"></div>

                {/* 4. Finance & Accounts Section */}
                <h6 className="section-header"> 
                    <span className='iconAmindTitel'><MdAccountBalanceWallet /></span><strong> الحسابات والمستخدمين</strong>
                </h6>
                <div className={`listContainer ${openSections.finance ? 'active' : ''}`}>
                    <h6 className={`listhead ${openSections.finance ? 'active' : ''}`} onClick={() => toggleSection('finance')}>
                        ▾ الإدارة {openSections.finance ? <IoIosArrowRoundDown /> : <IoIosArrowRoundBack />}
                    </h6>
                    {openSections.finance && (
                        <ul className='listItems'>
                            <li className={isActive('/admin/financial') ? 'active-link' : ''}>
                                <Link to="/admin/financial"><FaMoneyBillWave className="link-icon" /> الحسابات المالية</Link>
                            </li>
                            {userRole === 'superAdmin' && (
                                <>
                                    <li className={isActive('/admin/vendors') ? 'active-link' : ''}>
                                        <Link to="/admin/vendors"><FaStore className="link-icon" /> إدارة البائعين</Link>
                                    </li>
                                    <li className={isActive('/admin/all-accounts') ? 'active-link' : ''}>
                                        <Link to="/admin/all-accounts"><FaUsers className="link-icon" /> كل الحسابات</Link>
                                    </li>
                                </>
                            )}
                            <li className={isActive('/admin/my-account') ? 'active-link' : ''}>
                                <Link to="/admin/my-account"><BiUserCircle className="link-icon" /> إعدادات حسابي</Link>
                            </li>
                        </ul>
                    )}
                </div>

                {userRole === 'superAdmin' && (
                    <>
                        <div className="linebut"></div>
                        
                        {/* 5. Settings & Display Section */}
                        <h6 className="section-header"> 
                            <span className='iconAmindTitel'><MdSettingsApplications /></span><strong> إعدادات الموقع</strong>
                        </h6>
                        <div className={`listContainer ${openSections.settings ? 'active' : ''}`}>
                            <h6 className={`listhead ${openSections.settings ? 'active' : ''}`} onClick={() => toggleSection('settings')}>
                                ▾ المظهر والمسابقات {openSections.settings ? <IoIosArrowRoundDown /> : <IoIosArrowRoundBack />}
                            </h6>
                            {openSections.settings && (
                                <ul className='listItems'>
                                    <li className={isActive('/admin/createalbums') ? 'active-link' : ''}>
                                        <Link to="/admin/createalbums"><FaImages className="link-icon" /> عارض الصور الرئيسي</Link>
                                    </li>
                                    <li className={isActive('/admin/addalbum') ? 'active-link' : ''}>
                                        <Link to="/admin/addalbum"><FaImages className="link-icon" /> إضافة صور للعارض</Link>
                                    </li>
                                    <li className={isActive('/admin/competition') ? 'active-link' : ''}>
                                        <Link to="/admin/competition"><FaTrophy className="link-icon" /> المسابقات</Link>
                                    </li>
                                </ul>
                            )}
                        </div>
                    </>
                )}
                
                <div style={{height: "50px"}}></div>
            </div>
        </div>
    );
};

export default AdminSidebar;
