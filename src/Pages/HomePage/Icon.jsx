import React, { useState, useEffect } from "react";
import { FaWhatsapp } from "react-icons/fa6";
import { IoIosArrowUp } from "react-icons/io";
import { MdLocalPhone } from "react-icons/md";

function Icon() {
    const [iShow, setiShow] = useState(false);

    useEffect(() => {
        const ShowIcon = () => {
            if (window.scrollY >= 400) {
                setiShow(true);
            } else {
                setiShow(false);
            }
        };

        window.addEventListener("scroll", ShowIcon);
        return () => window.removeEventListener("scroll", ShowIcon);
    }, []);

    // دالة الاسكرول لأعلى
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth", // يخلي الحركة ناعمة
        });
    };

    return (
        <div className="sticky-i">
            <button
                type="button"
                onClick={scrollToTop}
                className={iShow ? "SI-btn" : "S-btn hidden"}
                style={{ marginBottom: "15px" }}
                title="لأعلي"
                aria-label="لأعلي"
            >
                <IoIosArrowUp />
            </button>

            <a
                className="SI-btn"
                href="tel:+201026388831"
                style={{ marginBottom: "15px" }}
                title="اتصل بنا"
                aria-label="اتصل بنا"
            >
                <MdLocalPhone />
            </a>

            <a
                className="SI-btn"
                href="https://api.whatsapp.com/send?phone=201026388831"
                target="_blank"
                rel="noreferrer"
                title="راسلنا على واتساب"
                aria-label="راسلنا على واتساب"
            >
                <FaWhatsapp />
            </a>

        </div>
    );
}

export default Icon;
