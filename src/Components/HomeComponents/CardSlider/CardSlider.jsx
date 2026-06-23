import React, { useMemo, useEffect } from "react";
import ProdCard from "../ProdCard/ProdCard";
import Slider from "react-slick";
import "./CardSlider.scss";
import { IoIosArrowBack } from "react-icons/io";
import { Link } from "react-router-dom";
import { useSubCategories } from "../../../hooks/useCategories";

const CardSlider = ({ link, sectionName, produactsData }) => {
    const { subcategories } = useSubCategories();

    const settings = useMemo(() => ({
        className: "center",
        dots: true,
        arrows: true,
        speed: 500,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        infinite: true,
        centerPadding: "1rem",
        swipeToSlide: true,
        slidesToShow: 5,
        lazyLoad: "ondemand",
        accessibility: true,
        responsive: [
            { breakpoint: 1440, settings: { slidesToShow: 4 } },
            { breakpoint: 1024, settings: { slidesToShow: 3 } },
            { breakpoint: 768, settings: { slidesToShow: 2 } },
            { breakpoint: 402, settings: { slidesToShow: 2 } },
            { breakpoint: 350, settings: { slidesToShow: 1 } },
        ],
    }), []);

    const productsToShow = useMemo(
        () =>
            produactsData.slice(0, 10).map((product) => {
                const subcategory = subcategories.find(
                    (sub) => sub.id === product.subcategoryId
                );
                const subcategoryName = subcategory ? subcategory.name_ar : "";

                return (
                    <ProdCard
                        key={product.id}
                        link={`/subcategory/${product.subcategoryId}/${subcategoryName}/product/${product.id}/${product.name_ar}`}
                        id={product.id}
                        img={product.image}
                        imgs={product.images}
                        name={product.name_ar}
                        description={product.slug}
                        price={product.price}
                        salePrice={product.salePrice}
                        isNew={product.isNew}
                        isSale={product.isSale}
                        sizeAr={product.size_ar}
                        sizeEn={product.size_en}
                        remaining={product.remaining}
                    />
                );
            }),
        [produactsData, subcategories]
    );

    // ✅ إزالة التركيز من أي عناصر داخل الشرائح المخفية
    useEffect(() => {
        const interval = setInterval(() => {
            const hiddenSlides = document.querySelectorAll(
                ".slick-slide[aria-hidden='true'] a, .slick-slide[aria-hidden='true'] button"
            );
            hiddenSlides.forEach((el) => el.setAttribute("tabindex", "-1"));
        }, 500); // تحديث كل نصف ثانية مع تحريك slider

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="card-slider-wrapper">
            <div className="head-more head-spaced">
                <Link to={link}>
                    <i>
                        <IoIosArrowBack />
                    </i>{" "}
                    المزيد
                </Link>
                <h1>{sectionName}</h1>
            </div>
            <div className="products-slider-container">
                <Slider {...settings}>{productsToShow}</Slider>
            </div>
        </div>
    );
};

export default CardSlider;
