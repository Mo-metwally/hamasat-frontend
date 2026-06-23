import React from 'react'
import './Categories.scss'
import { IoIosArrowBack } from "react-icons/io";
import Slider from "react-slick";
import { Link } from 'react-router-dom';
import { ThreeDot } from 'react-loading-indicators';



const Categories = ({ items, loading, error, hotLink, mainHotLink, hotName }) => {

    if (loading) {
        return (
            <div className='loading'>
                <ThreeDot color="#ff6f33" size="medium" />
            </div>
        )
    };
    if (error) return <p>Error fetching categories...</p>;

    const SmallCategory = ({ image, name, id }) => {
        return (
            <div className='ScategoryCard' id={id}>
                <img src={image} alt={`${name} فئة`} />
                <h2>{name}</h2>
            </div>
        );
    };

    const settings = {
        className: "center",
        centerMode: true,
        infinite: true,
        centerPadding: "40px",
        slidesToShow: 6,
        speed: 500,
        rows: 1,
        slidesPerRow: 1,
        responsive: [
            {
                breakpoint: 1200, // شاشات لحد 1200px
                settings: {
                    slidesToShow: 5,
                },
            },
            {
                breakpoint: 992, // تابلت كبير
                settings: {
                    slidesToShow: 4,
                },
            },
            {
                breakpoint: 768, // تابلت وصغير
                settings: {
                    slidesToShow: 3,
                },
            },
            {
                breakpoint: 576, // موبايلات
                settings: {
                    slidesToShow: 2,
                },
            },
            {
                breakpoint: 370, // موبايلات
                settings: {
                    slidesToShow: 1,
                },
            },
        ],
    };

    return (
        <div className='Categories-body'>
            <div className='head-more'>
                <Link to={`/${mainHotLink}`}><i><IoIosArrowBack /></i> المزيد</Link>
                <h1>{hotName}</h1>
            </div>
            <div className='small-category-container'>
                <Slider {...settings}>
                    {items.map((item) => (
                        <Link
                            key={item.id}
                            id={item.id}
                            to={`/${hotLink}/${item.id}/${item.name_ar}`}
                        >
                            <SmallCategory id={item.id} image={item.image} name={item.name_ar} />
                        </Link>
                    ))}
                </Slider>

            </div>

        </div>
    )
};

export default Categories