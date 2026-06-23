// FilterContext.js
import { createContext, useContext, useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";

const FilterContext = createContext();

export const FilterProvider = ({ children }) => {
    const [filterShow, setFilterShow] = useState(false);
    const filterRef = useRef(null);       // مرجع الفلتر
    const toggleBtnRef = useRef(null);    // مرجع زرار الفتح
    const location = useLocation();

    // دوال التحكم
    const toggleFilter = () => setFilterShow(prev => !prev);
    const openFilter = () => setFilterShow(true);
    const closeFilter = () => setFilterShow(false);

    // قفل الفلتر عند الضغط بره
    useEffect(() => {
        const handleClickOutside = (e) => {
            const clickedInsideFilter =
                filterRef.current && filterRef.current.contains(e.target);
            const clickedToggleButton =
                toggleBtnRef.current && toggleBtnRef.current.contains(e.target);

            // لو ضغطت على زرار الفتح → سيب التوجل يتحكم
            if (clickedToggleButton) return;

            // لو ضغطت على لينك جوه الفلتر → سيب الروتر يغير الصفحة
            if (clickedInsideFilter && e.target.closest("a")) return;

            // لو ضغطت برّه الفلتر وهو مفتوح → اقفل
            if (!clickedInsideFilter && filterShow) {
                closeFilter();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, [filterShow]);

    // قفل الفلتر عند تغيير الصفحة
    useEffect(() => {
        if (filterShow) {
            closeFilter();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location]);

    return (
        <FilterContext.Provider
            value={{
                filterShow,
                toggleFilter,
                openFilter,
                closeFilter,
                filterRef,
                toggleBtnRef,
            }}
        >
            {children}
        </FilterContext.Provider>
    );
};

export const useFilter = () => useContext(FilterContext);
