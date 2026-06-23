import React from 'react'
import { useSubCategories } from '../../../hooks/useCategories';
import { Link } from 'react-router-dom';
import { FourSquare } from 'react-loading-indicators';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import "react-lazy-load-image-component/src/effects/blur.css";
import SvgDic from '../../../Pages/HomePage/SvgDic';


export const MainCategory = ({ id, image, name }) => {

    return (

        <div className='McategoryCard' key={id} id={id} >
            <LazyLoadImage
                src={image} alt={`${name} فئة`}
                effect="blur"
            />
            <h2>{name}</h2>
        </div>

    );
};


const MainCategories = () => {
    const { categories, loading, error } = useSubCategories();

    if (loading) {
        return (
            <div className="loading">
                <FourSquare color={["#ff6f33"]} />
            </div>
        )
    };
    if (error) return <p>Error fetching categories...</p>;

    return (
        <div className='Categories-body'>
            <SvgDic />
            <div className='main-head'>
                <br />
                <h1>فئات رئيسية</h1>
            </div>
            <div className='main-category-container '>

                {categories
                    .slice() // نعمل نسخة عشان منعدّلش على الأصل
                    .sort((a, b) => a.name_ar.localeCompare(b.name_ar, "ar")) // sort بالاسم
                    .slice(0, 6) // بعد الفرز ناخد أول 6
                    .map((category) => (
                        <Link key={category.id} to={`/category/${category.id}/${category.name_ar}`}>
                            <MainCategory
                                id={category.id}
                                image={category.image}
                                name={category.name_ar}
                            />
                        </Link>
                    ))}

            </div>

        </div>
    )
}

export default MainCategories