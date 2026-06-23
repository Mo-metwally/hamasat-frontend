import React, { useEffect, useState } from 'react';
import './CategoriesPage.scss';
import { useSubCategories } from '../../hooks/useCategories';
import { MainCategory } from '../../Components/HomeComponents/Categories/MainCategories';
import { Link, useLocation } from 'react-router-dom';
import { FourSquare } from 'react-loading-indicators';
import Pagenation from '../../Components/ProductComponents/pagenation/Pagenation';
import { FaHome } from 'react-icons/fa';
import useTracking from '../../utils/useTracking';

const CategoriesPage = () => {
    const { subcategories, brands, loading, error } = useSubCategories();
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const location = useLocation();
    const isBrandsPage = location.pathname === '/allbrands';
    const isAllSubCatPage = location.pathname === '/allsubcategories';

    useTracking();

    const dataToShow = isBrandsPage ? brands : subcategories;

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    if (loading) {
        return (
            <div className="loading">
                <FourSquare color={["#ff6f33"]} />
            </div>
        );
    }

    if (error) return <p>Error: {error}</p>;

    const totalPages = Math.ceil(dataToShow.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = dataToShow.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="CategoriesWrapper" dir='rtl'>
            <div className="page-hot-links">
                <Link to="/" aria-label="الرئيسية"><FaHome /></Link>
                &gt;

                {isBrandsPage && (
                    <p>كل البراندات</p>
                )}

                {isAllSubCatPage && (
                    <p>كل الأقسام الفرعية</p>
                )}

            </div>
            <div id='allCategories'>
                {currentItems.map((item) => (
                    <div className="grid-item" key={item.id}>
                        {isBrandsPage ? (
                            <Link to={`/brand/${item.id}/${item.name_ar}`}>
                                <MainCategory id={item.id} image={item.image} name={item.name_ar} />
                            </Link>
                        ) : (
                            <Link to={`/subcategory/${item.id}/${item.name_ar}`}>
                                <MainCategory id={item.id} image={item.image} name={item.name_ar} />
                            </Link>
                        )}
                    </div>
                ))}
            </div>

            <Pagenation
                totalPages={totalPages}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
            />
        </div>
    );
};

export default CategoriesPage;
