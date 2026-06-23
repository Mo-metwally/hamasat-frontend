import React, { useEffect, useState } from 'react'
import './CategoriesPage.scss'
import { useSubCategories } from '../../hooks/useCategories';
import { MainCategory } from '../../Components/HomeComponents/Categories/MainCategories';
import { Link, useParams } from 'react-router-dom';
import { FourSquare } from 'react-loading-indicators';
import Pagenation from '../../Components/ProductComponents/pagenation/Pagenation';
import { FaHome } from 'react-icons/fa';
import { Helmet } from 'react-helmet-async';
import useTracking from '../../utils/useTracking';

const SubCategoriesPage = () => {

    const { catId, catName } = useParams();
    const { subcategories, loadingSubcategories, error } = useSubCategories();
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;
    useTracking();
    const filteredsubcar = catId
        ? subcategories.filter(subcategories => subcategories.categoryId === catId)
        : subcategories;

    useEffect(() => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }, [catId]);

    if (loadingSubcategories) {
        return (
            <div className="loading">
                <FourSquare color={["#ff6f33"]} />
            </div>
        )
    };
    if (error) return <p>Error: {error}</p>;

    const totalPages = Math.ceil(filteredsubcar.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = filteredsubcar.slice(startIndex, startIndex + itemsPerPage);

    return (
        <>
            <Helmet>
                {/* عنوان ووصف المتجر */}
                <title>{`معرض همسات - ${catName}`}</title>
                <link rel="manifest" href="https://hamsathome.com/site.webmanifest" />

                <meta
                    name="description"
                    content="اكتشف أحدث منتجات همسات للأدوات المنزلية. مجموعة متنوعة من الأدوات المميزة بجودة عالية وأسعار مناسبة."
                />
                <meta name="keywords" content={`${catName},همسات, همسات هوم, معرض همسات, تجهيز عرائس, اجهزة كهربائية, مفروشات, ادوات منزلية, ادوات مطبخ, مستلزمات العروسة, ديكورات, اطقم صيني, كاسات, اطقم عشاء, معرض تجهيز عرائس الشرقية, فاقوس, اثاث منزلي, اجهزة منزلية حديثة, اطقم طهي, طاسات جرانيت`} />

                <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
                <meta name="googlebot" content="index, follow" />
                <meta name="bingbot" content="index, follow" />
                {/* Canonical */}
                <link rel="canonical" href={`${process.env.REACT_APP_CLIENT_URL}/subcategory/${catId}/${catName}`} />

                {/* OG Tags الأساسية */}
                <meta property="og:type" content="product.group" />
                <meta property="og:title" content={`معرض همسات - ${catName}`} />
                <meta
                    property="og:description"
                    content="تسوق أحدث منتجات همسات للأدوات المنزلية."
                />
                <meta property="og:site_name" content="همسات هوم" />
                <meta property="og:url" content={`${process.env.REACT_APP_CLIENT_URL}/subcategory/${catId}/${catName}`} />

                {/* Twitter Card */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={`معرض همسات - ${catName}`} />
                <meta
                    name="twitter:description"
                    content="اكتشف أحدث منتجات همسات للأدوات المنزلية."
                />

            </Helmet>

            <div className="CategoriesWrapper" dir='rtl'>

                <div className="page-hot-links">
                    <Link to="/" aria-label="الرئيسية"><FaHome /></Link>
                    &gt;
                    <Link to="/allsubcategories">كل الأقسام الفرعية</Link>
                    &gt;
                    <p>{catName}</p>
                </div>
                <div id='allCategories'>
                    {currentItems.map((subcat) => (
                        <div className="grid-item" key={subcat.id}>
                            <Link to={`/subcategory/${subcat.id}/${subcat.name_ar}`} >
                                <MainCategory key={subcat.id} id={subcat.id} image={subcat.image} name={subcat.name_ar} />
                            </Link>
                        </div>
                    ))
                    }
                </div>
                <Pagenation
                    totalPages={totalPages}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                />
            </div>
        </>


    )
}

export default SubCategoriesPage