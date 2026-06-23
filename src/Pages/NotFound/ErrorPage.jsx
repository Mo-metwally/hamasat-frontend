
import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import logo from '../../Assets/HamasatLogo2.webp'
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import { Helmet } from "react-helmet-async";


const ErrorPage = ({ mainHead }) => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const message = queryParams.get("msg");
    const code = queryParams.get("code");



    const navigate = useNavigate();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);


    return (
        <>
            <Helmet>
                <title>خطأ - همسات هوم</title>
                <meta
                    name="description"
                    content="حدث خطأ غير متوقع أثناء تصفح الموقع. يرجى المحاولة لاحقاً."
                />
                <meta name="robots" content="noindex, nofollow" />
                <meta name="theme-color" content="#000000" />
                <link rel="canonical" href={`${process.env.REACT_APP_API_URL}/error`} />
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
                <h1 style={{ fontSize: "4rem", marginBottom: "1rem" }}>حدث خطأ ❌</h1>
                <p>{message || "Unknown error"}</p>
                <p>{code || "Unknown error"}</p>
                <p>نأسف للإزعاج، برجاء المحاولة لاحقًا</p>

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

export default ErrorPage;

