import React, { useState, useEffect } from 'react';
import { IoIosArrowRoundBack, IoIosArrowRoundDown } from "react-icons/io";
import { Link, useLocation } from 'react-router-dom';
import { MdDoubleArrow, MdDashboard, MdInventory, MdOutlinePointOfSale, MdAccountBalanceWallet, MdSettingsApplications } from "react-icons/md";
import { FaBoxOpen, FaClipboardList, FaStore, FaMoneyBillWave, FaTrophy, FaImages, FaUsers } from "react-icons/fa";
import { BsBoxSeam, BsTags } from "react-icons/bs";
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

        // Close sidebar on mobile when navigating
        if (typeof window !== 'undefined' && window.innerWidth <= 768) {
            setIsSidebarOpen(false);
        }
    }, [location]);

    const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
    const closeSidebar = () => setIsSidebarOpen(false);
    const toggleSection = (section) => setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    const isActive = (path) => location.pathname + location.search === path;

    const handleLinkClick = () => {
        if (typeof window !== 'undefined' && window.innerWidth <= 768) {
            closeSidebar();
        }
    };

    return (
        <>
            {/* Backdrop overlay for mobile / clicking outside */}
            <div 
                className={`adminSidebarOverlay ${isSidebarOpen ? 'show' : ''}`} 
                onClick={closeSidebar}
                aria-hidden="true"
            />

            <div id='AdminSidebar' className={isSidebarOpen ? "sidebarShow" : "sidebarHide"}>
                <div className='sidebarHead'>
                    <button 
                        type="button"
                        className={`listIcon ${isSidebarOpen ? 'rotated' : ''}`} 
                        onClick={toggleSidebar}
                        title={isSidebarOpen ? "إغلاق القائمة" : "فتح القائمة"}
                        aria-label={isSidebarOpen ? "إغلاق القائمة" : "فتح القائمة"}
                    >
                        <MdDoubleArrow />
                    </button>
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
                                    <Link to="/admin" onClick={handleLinkClick}><FaClipboardList className="link-icon" /> عرض سريع</Link>
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
                                    <Link to="/admin/addproducts" onClick={handleLinkClick}><BsBoxSeam className="link-icon" /> إضافة منتج جديد</Link>
                                </li>
                                <li className={isActive('/admin/addcategories') ? 'active-link' : ''}>
                                    <Link to="/admin/addcategories" onClick={handleLinkClick}><BsTags className="link-icon" /> {userRole === 'superAdmin' ? 'إضافة فئة أو ماركة' : 'إضافة فئة فرعية'}</Link>
                                </li>
                                <li className={isActive('/admin/productslist?sort=createdAt') ? 'active-link' : ''}>
                                    <Link to="/admin/productslist?sort=createdAt" onClick={handleLinkClick}><FaBoxOpen className="link-icon" /> مخزن المنتجات</Link>
                                </li>
                                <li className={isActive('/admin/categorieslist') ? 'active-link' : ''}>
                                    <Link to="/admin/categorieslist" onClick={handleLinkClick}><FaClipboardList className="link-icon" /> مخزن الفئات</Link>
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
                                <li className={isActive('/admin/orders') ? 'active-link' : ''}><Link to="/admin/orders" onClick={handleLinkClick}>كل الطلبات</Link></li>
                                <li className={isActive('/admin/orders?status=pending') ? 'active-link' : ''}><Link to="/admin/orders?status=pending" onClick={handleLinkClick}>طلبات جديدة</Link></li>
                                <li className={isActive('/admin/orders?status=processed') ? 'active-link' : ''}><Link to="/admin/orders?status=processed" onClick={handleLinkClick}>قيد التنفيذ</Link></li>
                                <li className={isActive('/admin/orders?status=shipped') ? 'active-link' : ''}><Link to="/admin/orders?status=shipped" onClick={handleLinkClick}>خرج للتوصيل</Link></li>
                                <li className={isActive('/admin/orders?status=delivered') ? 'active-link' : ''}><Link to="/admin/orders?status=delivered" onClick={handleLinkClick}>تم التسليم</Link></li>
                                <li className={isActive('/admin/orders?status=returned') ? 'active-link' : ''}><Link to="/admin/orders?status=returned" onClick={handleLinkClick}>مرتجع</Link></li>
                                <li className={isActive('/admin/orders?status=canceled') ? 'active-link' : ''}><Link to="/admin/orders?status=canceled" onClick={handleLinkClick}>تم الإلغاء</Link></li>
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
                                    <Link to="/admin/financial" onClick={handleLinkClick}><FaMoneyBillWave className="link-icon" /> الحسابات المالية</Link>
                                </li>
                                {userRole === 'superAdmin' && (
                                    <>
                                        <li className={isActive('/admin/vendors') ? 'active-link' : ''}>
                                            <Link to="/admin/vendors" onClick={handleLinkClick}><FaStore className="link-icon" /> إدارة البائعين</Link>
                                        </li>
                                        <li className={isActive('/admin/all-accounts') ? 'active-link' : ''}>
                                            <Link to="/admin/all-accounts" onClick={handleLinkClick}><FaUsers className="link-icon" /> كل الحسابات</Link>
                                        </li>
                                    </>
                                )}
                                <li className={isActive('/admin/my-account') ? 'active-link' : ''}>
                                    <Link to="/admin/my-account" onClick={handleLinkClick}><BiUserCircle className="link-icon" /> إعدادات حسابي</Link>
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
                                            <Link to="/admin/createalbums" onClick={handleLinkClick}><FaImages className="link-icon" /> عارض الصور الرئيسي</Link>
                                        </li>
                                        <li className={isActive('/admin/addalbum') ? 'active-link' : ''}>
                                            <Link to="/admin/addalbum" onClick={handleLinkClick}><FaImages className="link-icon" /> إضافة صور للعارض</Link>
                                        </li>
                                        <li className={isActive('/admin/competition') ? 'active-link' : ''}>
                                            <Link to="/admin/competition" onClick={handleLinkClick}><FaTrophy className="link-icon" /> المسابقات</Link>
                                        </li>
                                    </ul>
                                )}
                            </div>
                        </>
                    )}
                    
                    <div style={{height: "50px"}}></div>
                </div>
            </div>
        </>
    );
};

export default AdminSidebar;
