import React, { useEffect, useRef, useState } from "react";
import Slogo from "../../../Assets/HamasatLogo2.webp";
import "./Nav.scss";
import { Link as LinkS } from "react-scroll";
import { Link, useLocation } from "react-router-dom";
import { IoMdSearch } from "react-icons/io";
import { FaHome } from "react-icons/fa";
import { TiShoppingCart } from "react-icons/ti";
import { RxMixerHorizontal } from "react-icons/rx";
import { MdOutlineMenuOpen } from "react-icons/md";
import { useFilter } from "../../../Context/FilterContext";
import { useCart } from "../../../Context/CartContext";
import { useAuth } from "../../../Context/AuthContext";
import { TiStarFullOutline } from "react-icons/ti";
import { FaUserCircle } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import { MdOutlineDashboard } from "react-icons/md";
import axios from "axios";

const Nav = ({ searchBtn, offers }) => {
    const cart = useCart();
    const { filterShow, toggleFilter, toggleBtnRef } = useFilter();
    const [hideNav, setHideNav] = useState(false);
    const [lastScroll, setLastScroll] = useState(0);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 700);

    const cartQuantity = cart?.cart?.products?.length || 0;

    const { user, checkAuth } = useAuth();
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    // قفل الدروب داون عند الضغط خارجها
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showDropdown]);

    const handleLogout = async () => {
        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/api/v1/auth/logout`, {}, { withCredentials: true });
            checkAuth(); // تحديث حالة الدخول
            window.location.href = "/";
        } catch (error) {
            console.error("Logout failed", error);
        }
    };


    // تحديث حالة الموبايل عند تغيير حجم الشاشة
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 700);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // منطق الإخفاء يعمل فقط في الموبايل

    useEffect(() => {
        const handleScroll = () => {
            const currentScroll = window.scrollY;

            if (currentScroll > lastScroll && currentScroll > 200) {
                setHideNav(true);
            }
            else if (lastScroll - currentScroll > 10) {
                setHideNav(false);
            }

            setLastScroll(currentScroll);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [lastScroll]);

    const [showFilterBtn, setShowFilterBtn] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [menuAnimation, setMenuAnimation] = useState(""); // Animation for menu
    const [menuHeadAnimation, setMenuHeadAnimation] = useState(""); // Animation for nav head
    const menuRef = useRef(null);
    const location = useLocation();
    const [searchActive, setSearchActive] = useState(false);
    // eslint-disable-next-line no-unused-vars
    const [menuActive, setMenuActive] = useState(false);


    const handleSearchClick = () => {
        searchBtn();
    };

    // لو غيرنا الصفحة نخلي السيرش/فلتر/مينيو يتقفلوا
    React.useEffect(() => {
        setSearchActive(false);
        setMenuActive(false);
    }, [location]);

    // دالة علشان نحدد هل الزر الحالي active ولا لأ
    const isActive = (path) => location.pathname === path;


    const toggleMobileMenu = () => {
        if (mobileMenuOpen) {
            // إغلاق القائمة أولًا
            setMenuHeadAnimation("mobileNav-hide"); // navSlideReverse

            // بعد 200ms، نبدأ إخفاء الـ nav head
            setTimeout(() => {
                setMenuAnimation("mobileMenu-hide"); // قائمة تنزل (slideXYReverse)
            }, 80);

            // بعد 400ms (نهاية الأنيميشن بالكامل) نرجع القيم الأولية
            setTimeout(() => {
                setMenuHeadAnimation(false);
                setMobileMenuOpen(false);
                setMenuAnimation("");
            }, 400);
        } else {
            // فتح القائمة: أولًا نشغل أنيميشن ظهور الـ nav head
            setMenuHeadAnimation("mobileNav-show"); // navSlide

            // نفتح القائمة بعد تأخير بسيط (200ms) عشان يظهر الـ nav head أولاً
            setTimeout(() => {
                setMenuAnimation("mobileMenu-show"); // slideXY
                setMobileMenuOpen(true);
            },);
        }
    };

    // قفل المينيو عند الضغط خارجها
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                if (mobileMenuOpen) toggleMobileMenu();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mobileMenuOpen]);

    // قفل المينيو عند تغيير الصفحة
    useEffect(() => {
        if (mobileMenuOpen) toggleMobileMenu();
        const productsPageElement = document.getElementById("productsPage");
        setShowFilterBtn(!!productsPageElement);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location]);


    return (
        <>
            {isMobile ? (
                <>
                    <nav ref={menuRef} className={`mobileMenu ${menuAnimation}`}>
                        <div className={`mobileNav ${menuHeadAnimation}`}>
                            <p>وصول سريع</p>
                            <img className="logo" src={Slogo} alt="logo" />
                        </div>
                        <ul className={`ul`}>
                            {user && <li><Link to="/admin" style={{ color: 'var(--main-color)', fontWeight: 'bold' }}>لوحة التحكم</Link></li>}
                            <li><Link to="/shop">المتجر</Link></li>
                            {offers.length > 0 && (<li><Link to="/offers">العروض</Link></li>)}
                            <li><Link to="/allsubcategories">الأقسام</Link></li>
                            <li><Link to="/allvendor">البرندات</Link></li>
                            <li><Link to="/bestselling">الأكثر مبيعاً</Link></li>
                            <li><Link to="/newarrival">وصل حديثاً</Link></li>
                            <li><Link to="/followup">متابعة الطلبات</Link></li>
                            <li><LinkS className="scrollBtn" to="Contact">تواصل معنا</LinkS></li>
                        </ul>
                    </nav>

                    <div className="butmNav">
                        <div className="butmNav-items">

                            <div className={`butmNav-item ${isActive("/") ? "butNav-active" : ""}`}>
                                <Link to="/" aria-label="الرئيسية">
                                    <FaHome />
                                </Link>
                            </div>

                            <div
                                aria-label="بحث"
                                className={`butmNav-item ${searchActive ? "butNav-active" : ""}`}
                                onClick={handleSearchClick}
                            >
                                <IoMdSearch />
                            </div>


                            <div className={`butmNav-item ${isActive("/cart") ? "butNav-active" : ""}`}>
                                <Link to="/cart" aria-label="العربة">
                                    <TiShoppingCart />
                                    {cartQuantity >= 1 && <span><TiStarFullOutline /></span>}
                                </Link>
                            </div>

                            {showFilterBtn && (
                                <div
                                    ref={toggleBtnRef}
                                    className={`butmNav-item ${filterShow ? "butNav-active" : ""}`}
                                    onClick={toggleFilter}
                                >
                                    <RxMixerHorizontal />
                                </div>
                            )}


                            <div className={`butmNav-item ${mobileMenuOpen ? "butNav-active" : ""}`}>
                                <MdOutlineMenuOpen onClick={toggleMobileMenu} />
                            </div>

                        </div>
                    </div>
                </>
            ) : (
                <header id="navbar" className={`CustNav ${hideNav ? "hideNav" : ""}`}>

                    <img className="logo" src={Slogo} alt="logo" onClick={() => window.location.href = "/"} />

                    <nav>
                        <ul>
                            <li><Link className={`${isActive("/") ? "itemNav-active" : ""}`} to="/">الرئيسة</Link></li>
                            {offers.length > 0 && (<li><Link className={`${isActive("/offers") ? "itemNav-active" : ""}`} to="/offers">العروض</Link></li>)}
                            <li><Link className={`${isActive("/shop") ? "itemNav-active" : ""}`} to="/shop">المتجر</Link></li>
                            <li>
                                <LinkS className="scrollBtn" to="Contact">تواصل معنا</LinkS>
                            </li>

                            <li><Link className={`${isActive("/orders") ? "itemNav-active" : ""}`} to="/orders">الطلبات</Link></li>
                            <li className="cartNav">
                                <Link className={`${isActive("/cart") ? "itemNav-active" : ""}`} to="/cart">العربة
                                    {cartQuantity >= 1 && <span>{cartQuantity}</span>}
                                </Link>
                            </li>
                        </ul>
                    </nav>
                    <div className="btn-container">
                        {user && (
                            <div className="user-dropdown-container" ref={dropdownRef}>
                                <button className="user-btn" onClick={() => setShowDropdown(!showDropdown)}>
                                    <FaUserCircle className="user-icon" />
                                    <span className="user-name">{user.name.split(' ')[0]}</span>
                                </button>
                                {showDropdown && (
                                    <div className="user-dropdown-menu">
                                        <div className="dropdown-header">
                                            <strong>{user.name}</strong>
                                            <span>{user.email}</span>
                                        </div>
                                        <ul>
                                            <li>
                                                <Link to="/admin" onClick={() => setShowDropdown(false)}>
                                                    <MdOutlineDashboard /> لوحة التحكم
                                                </Link>
                                            </li>
                                            <li>
                                                <Link to={`/vendor/${user._id || user.id}`} onClick={() => setShowDropdown(false)}>
                                                    <FaUserCircle /> حسابي
                                                </Link>
                                            </li>
                                            <li className="logout-li">
                                                <button onClick={handleLogout} className="logout-btn">
                                                    <FiLogOut /> تسجيل الخروج
                                                </button>
                                            </li>
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                        <button type="button" className="C-btn" onClick={searchBtn}>
                            بحث <IoMdSearch />
                        </button>
                    </div>
                </header>
            )}
        </>
    );
};

export default Nav;
