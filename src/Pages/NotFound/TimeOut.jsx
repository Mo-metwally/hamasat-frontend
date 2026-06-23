import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../Assets/HamasatLogo2.webp";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import { Helmet } from "react-helmet-async";
import useTracking from "../../utils/useTracking";

const TimeOutPage = () => {
    const navigate = useNavigate();
    const DURATION = 180; // 3 دقايق = 180 ثانية
    useTracking();
    const [timeLeft, setTimeLeft] = useState(DURATION);

    useEffect(() => {
        window.scrollTo(0, 0);

        // 🔹 نشوف لو فيه وقت انتهاء محفوظ قبل كده
        const storedEndTime = localStorage.getItem("timeout_end");
        let endTime;

        if (storedEndTime) {
            endTime = parseInt(storedEndTime, 10);
        } else {
            endTime = Date.now() + DURATION * 1000;
            localStorage.setItem("timeout_end", endTime);
        }

        const timer = setInterval(() => {
            const diff = Math.floor((endTime - Date.now()) / 1000);

            if (diff <= 0) {
                clearInterval(timer);
                setTimeLeft(0);
                localStorage.removeItem("timeout_end"); // نحذف بعد ما يخلص
                navigate("/"); // 🔹 يرجع للرئيسية بعد انتهاء العد
            } else {
                setTimeLeft(diff);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [navigate]);


    // تحويل الثواني إلى دقائق:ثواني
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
        <>
            <Helmet>
                <title>انتهاء المهلة - همسات هوم</title>
                <meta
                    name="description"
                    content="انتهت مهلة الاتصال بالخادم. يرجى إعادة تحميل الصفحة أو المحاولة لاحقاً."
                />
                <meta name="robots" content="noindex, nofollow" />
                <meta name="theme-color" content="#000000" />
                <link rel="canonical" href={`${process.env.REACT_APP_API_URL}/timeout`} />
            </Helmet>

            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100vh",
                    textAlign: "center",
                }}
            >
                <LazyLoadImage
                    src={logo}
                    alt="logo"
                    effect="blur"
                    width="300px"
                    height="auto"
                />
                <h1 dir="rtl" style={{ fontSize: "4rem", marginBottom: "1rem" }}>تعذر الاتصال بالخادم!</h1>
                <h4 dir="rtl"><strong>حاول مجدداً بعد:</strong></h4>{" "}
                <p style={{ fontSize: "2rem", fontWeight: "bold" }}>
                    {minutes}:{seconds.toString().padStart(2, "0")}
                </p>
                <a className="C-btn" href="/">العودة للرئيسية</a>
            </div>
        </>
    );
};

export default TimeOutPage;
