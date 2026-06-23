import React, { useState, useEffect, useRef } from 'react';
import { FaMagnifyingGlassPlus } from "react-icons/fa6";
import { FaChevronLeft, FaChevronRight, FaTimes } from "react-icons/fa";
import { IoIosArrowBack, IoIosArrowDown, IoIosArrowForward, IoIosArrowUp } from "react-icons/io";


const GallaryModel = ({ product }) => {
    const allImages = [product.image, ...(product.images || [])];
    const [selectedImage, setSelectedImage] = useState(product.image);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const currentIndex = allImages.indexOf(selectedImage);

    // 🟢 refs لكل thumbnail
    const thumbRefs = useRef([]);

    const handlePrev = () => {
        const prevIndex = (currentIndex - 1 + allImages.length) % allImages.length;
        setSelectedImage(allImages[prevIndex]);
    };

    const handleNext = () => {
        const nextIndex = (currentIndex + 1) % allImages.length;
        setSelectedImage(allImages[nextIndex]);
    };

    // 👇 Reset image when product changes
    useEffect(() => {
        setSelectedImage(product.image);
    }, [product.image, product.id]);



    // 👇 Scroll active thumbnail into view
    useEffect(() => {
        if (thumbRefs.current[currentIndex]) {
            thumbRefs.current[currentIndex].scrollIntoView({
                behavior: "smooth",
                block: "nearest",
                inline: "center"
            });
        }
    }, [currentIndex]);


    // 🟢 Swipe handlers for mobile
    let touchStartX = 0;
    let touchEndX = 0;

    const handleTouchStart = (e) => {
        touchStartX = e.touches[0].clientX;
    };

    const handleTouchEnd = (e) => {
        touchEndX = e.changedTouches[0].clientX;
        if (touchStartX - touchEndX > 1) {
            handleNext();
        }
        if (touchEndX - touchStartX > 1) {
            handlePrev();
        }
    };

    return (
        <>
            <div className="product-images-container" dir="rtl">
                <div
                    className="main-image"
                    onClick={() => setIsModalOpen(true)}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                >
                    <img src={selectedImage} alt={product.name_ar} />
                    <div className="zoom-icon">
                        <FaMagnifyingGlassPlus />
                    </div>
                </div>

                <div className="thumbnail-gallery-wrapper">
                    <button className="thumb-nav prev"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handlePrev();
                        }}
                    >
                        {window.innerWidth > 768 ? (<IoIosArrowUp />) : (<IoIosArrowForward />)}
                    </button>

                    <div className="thumbnail-gallery">
                        {allImages.map((img, index) => (
                            <img
                                key={index}
                                ref={(el) => (thumbRefs.current[index] = el)}
                                className={`thumbnail ${selectedImage === img ? 'active' : ''}`}
                                src={img}
                                alt={`thumb-${index}`}
                                onClick={() => setSelectedImage(img)}
                            />
                        ))}
                    </div>

                    <button className="thumb-nav next"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleNext();
                        }}
                    >
                        {window.innerWidth > 768 ? (<IoIosArrowDown />) : (<IoIosArrowBack />)}
                    </button>
                </div>
            </div>

            {isModalOpen && (
                <div className="image-modal" onClick={() => setIsModalOpen(false)}>
                    <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                        <FaTimes />
                    </button>
                    <div
                        className="modal-content"
                        onClick={(e) => e.stopPropagation()}
                        onTouchStart={handleTouchStart}
                        onTouchEnd={handleTouchEnd}
                    >
                        <img src={selectedImage} alt="zoom" />
                        <button className="nav-btn left" onClick={handlePrev}><FaChevronLeft /></button>
                        <button className="nav-btn right" onClick={handleNext}><FaChevronRight /></button>
                    </div>
                </div>
            )}
        </>
    );
};

export default GallaryModel;
