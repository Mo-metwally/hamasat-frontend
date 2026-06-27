import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './AdminNav.css'
import axios from 'axios';
import { useAuth } from '../../../Context/AuthContext';
import { FaMoon, FaSun } from 'react-icons/fa';

const AdminNav = ({ theme, toggleTheme }) => {
    const navigate = useNavigate();
    const location = useLocation().pathname;
    const { user, checkAuth } = useAuth();


    const handleLogout = async () => {
        const confirmLogout = window.confirm("هل أنت متأكد من تسجيل الخروج؟");

        if (!confirmLogout) return;

        try {
            // إرسال طلب logout إلى السيرفر
            await axios.post(`${process.env.REACT_APP_API_URL}/api/v1/auth/logout`, {}, { withCredentials: true });

            // Clear context after successful logout
            await checkAuth();

            // إعادة توجيه المستخدم إلى صفحة تسجيل الدخول بعد الخروج
            navigate('/login');
        } catch (error) {
            console.error('Error logging out:', error);
            // يمكنك هنا إضافة رسالة خطأ أو تنفيذ أي إجراء آخر في حال حدوث مشكلة
        }
    };


    const nameMap = () => {
        if (location.startsWith("/admin/orders/print-invoice")) return "فاتورة الطلب";
        if (location.startsWith("/admin/editproduct")) return "تعديل المنتج";

        switch (location) {
            case "/admin/productslist":
                return "مخزن المنتجات";
            case "/admin/categorieslist":
                return "مخزن الفئات";
            case "/admin/orders":
                return "إدارة الطلبات";
            case "/admin":
                return "لوحة التحكم";
            case "/admin/addcategories":
                return "إضافة فئة أو ماركة";
            case "/admin/addproducts":
                return "إضافة منتج جديد";
            case "/admin/duplicateproduct":
                return "إضافة منتج فرعي";
            case "/admin/financial":
            case "/admin/finance":
                return "الحسابات المالية";
            case "/admin/createalbums":
                return "عارض الصور الرئيسي";
            case "/admin/addalbum":
                return "إضافة صور للعارض";
            case "/admin/competition":
                return "إدارة المسابقات";
            case "/admin/vendors":
                return "قائمة البائعين";
            case "/admin/all-accounts":
                return "كل الحسابات";
            case "/admin/my-account":
                return "إعدادات حسابي";
            default:
                return "";
        }
    };

    return (
        <div className='adminNav' dir='rtl'>
            <div className="adminNav-group right-group">
                <div className="adminNavItem title">
                    <h5>{nameMap()}</h5>
                </div>
                <span className="admin-username">
                    {user?.name ? `أهلاً، ${user.name}` : ''}
                </span>
            </div>

            <div className="adminNav-group left-group">
                <Link className='C-btn' to='/'>الرئيسية</Link>
                <button 
                    type='button' 
                    className='theme-toggle-btn' 
                    onClick={toggleTheme}
                    title={theme === 'dark' ? "الوضع الفاتح" : "الوضع الداكن"}
                >
                    {theme === 'dark' ? <FaSun className="sun-icon" /> : <FaMoon className="moon-icon" />}
                </button>
                <button type='button' className='C-btn' onClick={handleLogout}>تسجيل خروج</button>
            </div>
        </div>
    );
};

export default AdminNav;
