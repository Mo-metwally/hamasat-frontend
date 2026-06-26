import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import './Admin.css'
import AdminNav from '../../Components/AdminCoponents/AdminNav/AdminNav'
import axios from 'axios';
import AdminSidebar from '../../Components/AdminCoponents/AdminSidebar/AdminSidebar';
import { Helmet } from 'react-helmet-async';

const Admin = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState(null);
    const [theme, setTheme] = useState(localStorage.getItem('adminTheme') || 'light');

    useEffect(() => {
        let isMounted = true;

        const checkUser = async () => {
            try {
                const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/auth/check-user`, {
                    withCredentials: true,
                });

                if (!isMounted) return;

                if (res.data.success && (res.data.data.role === 'admin' || res.data.data.role === 'superAdmin')) {
                    setUserRole(res.data.data.role);
                    setLoading(false);
                } else {
                    navigate('/login', { replace: true });
                }
            } catch (err) {
                if (!isMounted) return;
                console.error("Error checking user:", err);
                navigate('/login', { replace: true });
            }
        };

        checkUser();

        return () => {
            isMounted = false;
        }
    }, [navigate]);

    useEffect(() => {
        localStorage.setItem('adminTheme', theme);
    }, [theme]);


    if (loading) {
        return <div>Loading...</div>;
    }

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    return (
        <>
            <Helmet>
                <title>لوحة التحكم </title>
                <meta
                    name="description"
                    content="منطقة الإدارة الخاصة بمنصة همسات هوم. لإدارة المنتجات، الطلبات، الفواتير والألبومات."
                />
                <meta name="robots" content="noindex, nofollow" />
                <meta name="theme-color" content={theme === 'dark' ? "#0f1115" : "#f9fbfd"} />
                <link rel="manifest" href="https://hamsathome.com/admin.webmanifest" />
                <link rel="canonical" href={`${process.env.REACT_APP_API_URL}/admin`} />
            </Helmet>

            <div id='admin' data-theme={theme}>
                <div className='navContainer'>
                    <AdminNav theme={theme} toggleTheme={toggleTheme} />
                </div>
                <div className="adminContainer">
                    <div className='adminSidebar'>
                        <AdminSidebar userRole={userRole} theme={theme} />
                    </div>
                    <div className='adminRoutes'>
                        <Outlet context={{ userRole, theme }} />
                    </div>
                </div>
            </div>
        </>
    );
};

export default Admin;
