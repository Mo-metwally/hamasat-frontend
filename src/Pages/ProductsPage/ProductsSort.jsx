import React from "react";
import { FaSort, FaSortAmountUp, FaSortAmountDown } from "react-icons/fa";
import { useState, useRef, useEffect } from "react";

const sortNamesMap = {
    name: "الاسم",
    newest: "الأحدث",
    oldest: "الأقدم",
    "highest-price": "الأعلى سعراً",
    "lowest-price": "الأقل سعراً",
    "top-sold": "الأكثر مبيعاً",
    offer: "العروض",
};

const ProductsSort = ({ sortBy, setSortBy, sortOrder, setSortOrder }) => {
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef(null);

    const handleSelect = (value) => {
        setSortBy(value);
        setOpen(false);
    };

    // النص الحالي المعروض حسب الاختيار
    const selectedName = sortNamesMap[sortBy] || "اختر";

    // إغلاق القائمة عند الضغط بره
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="sort-wrapper" ref={wrapperRef}>
            {/* أيكون تفتح وتقفل الليستة */}
            <div className="sort-icon" onClick={() => setOpen(!open)}>
                <FaSort size={20} />
                <p>
                    <small>ترتيب حسب: {selectedName}</small>
                </p>
            </div>

            {/* الليستة */}
            {open && (
                <ul className="sort-dropdown">
                    {Object.entries(sortNamesMap).map(([key, label]) => (
                        <li
                            key={key}
                            onClick={() => handleSelect(key)}
                            className={sortBy === key ? "seclectedAct" : ""}
                        >
                            ترتيب حسب: {label}
                        </li>
                    ))}
                </ul>

            )}

            {/* أيكون الترتيب */}
            <div className="sort-order-icons">
                <FaSortAmountUp
                    className={sortOrder === "asc" ? "active" : ""}
                    onClick={() => setSortOrder("asc")}
                />
                <FaSortAmountDown
                    className={sortOrder === "desc" ? "active" : ""}
                    onClick={() => setSortOrder("desc")}
                />
            </div>
        </div>
    );
};

export default ProductsSort;
