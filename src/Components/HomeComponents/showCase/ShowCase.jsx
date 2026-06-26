import React, { useEffect, useState } from 'react';
import './ShowCase.scss';
import { Carousel } from 'react-bootstrap';
import axios from 'axios';
import fallBackImg from '../../../Assets/Showcase.webp';
import { Link } from 'react-router-dom';

const fallbackImage = fallBackImg;

const ShowCase = () => {
    const [slides, setSlides] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // تحقق لو فيه بيانات متخزنة في sessionStorage
        const cachedSlides = sessionStorage.getItem('showcaseSlides');
        if (cachedSlides) {
            setSlides(JSON.parse(cachedSlides));
            setLoading(false);
            return; // ما تجيبش من الباك تاني
        }

        const fetchAlbums = async () => {
            try {
                const { data } = await axios.get(
                    `${process.env.REACT_APP_API_URL}/api/v1/albums`
                );

                if (data.success && data.data?.images?.length > 0) {
                    const formattedSlides = data.data.images.map((imgObj) => ({
                        img: imgObj.image,
                        link: imgObj.link,
                    }));
                    setSlides(formattedSlides);

                    // خزّن الصور في sessionStorage
                    sessionStorage.setItem(
                        'showcaseSlides',
                        JSON.stringify(formattedSlides)
                    );
                } else {
                    setSlides([{ img: fallbackImage }]);
                }
            } catch (err) {
                setSlides([{ img: fallbackImage }]);
            } finally {
                setLoading(false);
            }
        };

        fetchAlbums();
    }, []);

    return (
        <div className='showcase'>
            <Carousel>
                {/* LCP Image ثابتة لتحسين Largest Contentful Paint */}
                <Carousel.Item>
                    <Link to="/shop">
                        <img
                            src={fallbackImage}
                            alt="همسات هوم لتجهيز المنازل"
                            fetchpriority="high"
                            decoding="async"
                        />
                    </Link>
                </Carousel.Item>

                {/* باقي الصور بعد تحميل البيانات */}
                {!loading &&
                    slides.map((slide, index) => (
                        <Carousel.Item key={index}>
                            {slide.link ? (
                                <Link to={slide.link}>
                                    <img
                                        src={slide.img}
                                        alt="همسات هوم لتجهيز المنازل"
                                        fetchpriority="high"
                                        decoding="async"
                                    />
                                </Link>
                            ) : (
                                <Link to="/shop">
                                    <img
                                        src={slide.img}
                                        alt="همسات هوم لتجهيز المنازل"
                                        fetchpriority="high"
                                        decoding="async"
                                    />
                                </Link>
                            )}
                        </Carousel.Item>
                    ))}
            </Carousel>
        </div>
    );
};

export default ShowCase;
