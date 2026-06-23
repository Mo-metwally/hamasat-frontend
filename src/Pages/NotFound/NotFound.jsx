import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from '../../Assets/HamasatLogo2.webp'
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import { Helmet } from "react-helmet-async";
import useTracking from "../../utils/useTracking";

const NotFound = () => {
    useTracking();
    const navigate = useNavigate();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);
    return (
        <>
            <Helmet>
                <title>الصفحة غير موجودة - همسات هوم</title>
                <meta
                    name="description"
                    content="عذراً، الصفحة التي تبحث عنها غير موجودة. تحقق من الرابط أو عد إلى الصفحة الرئيسية."
                />
                <meta name="robots" content="noindex, nofollow" />
                <meta name="theme-color" content="#000000" />
                <link rel="canonical" href={`${process.env.REACT_APP_API_URL}/404`} />

            </Helmet>

            <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100vh",
                textAlign: "center"
            }}>
                <LazyLoadImage
                    src={logo}
                    alt="logo"
                    effect="blur"   // 👈 بيعمل تأثير عند التحميل
                    width="300px"
                    height="auto"
                />
                <h1 style={{ fontSize: "4rem", marginBottom: "1rem" }}>404</h1>
                <p style={{ fontSize: "1.2rem", marginBottom: "2rem" }}>
                    عذراً، الصفحة التي تبحث عنها غير موجودة.
                    <br />
                    أو تم مسح المنتج الذي تبحث عنة

                </p>
                <button
                    className="C-btn"
                    onClick={() => navigate("/")}

                >
                    العودة للرئيسية
                </button>
            </div>
        </>
    );
};

export default NotFound;
